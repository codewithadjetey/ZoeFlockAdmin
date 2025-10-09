import '../models/first_timer.dart';
import '../orm/entities/first_timer_entity.dart';
import '../orm/orm_database_service.dart';
import 'api_service.dart';
import 'dart:convert';

class FirstTimerPushService {
  static final FirstTimerPushService _instance = FirstTimerPushService._internal();
  factory FirstTimerPushService() => _instance;
  FirstTimerPushService._internal();

  final ApiService _apiService = ApiService();
  final OrmDatabaseService _ormDatabaseService = OrmDatabaseService();

  /// Push all unpushed first timers to server
  /// Only selects first timers where is_pushed_to_server = 0
  /// After each successful push, sets is_pushed_to_server = 1
  Future<void> pushUnpushedFirstTimers() async {
    try {
      print('\n========================================');
      print('FirstTimerPushService: Starting to push unpushed first timers...');
      print('FirstTimerPushService: Query: WHERE is_pushed_to_server = 0');
      print('========================================');
      
      await _ormDatabaseService.initialize();
      final repository = _ormDatabaseService.getRepository<FirstTimerRepository>();
      
      if (repository == null) {
        print('FirstTimerPushService: ERROR - FirstTimerRepository not found');
        return;
      }

      final unpushedFirstTimers = await repository.getUnpushedFirstTimers();
      print('FirstTimerPushService: Found ${unpushedFirstTimers.length} unpushed first timers (is_pushed_to_server = 0)');

      if (unpushedFirstTimers.isEmpty) {
        print('FirstTimerPushService: ✅ No first timers to push');
        print('========================================\n');
        return;
      }

      int successCount = 0;
      int failureCount = 0;

      for (int i = 0; i < unpushedFirstTimers.length; i++) {
        final firstTimerEntity = unpushedFirstTimers[i];
        print('\n========================================');
        print('FirstTimerPushService: Processing first timer ${i + 1}/${unpushedFirstTimers.length}');
        print('FirstTimerPushService: Name: ${firstTimerEntity.name}');
        print('FirstTimerPushService: Local ID: ${firstTimerEntity.id}');
        print('FirstTimerPushService: Temp ID: ${firstTimerEntity.tempId}');
        print('FirstTimerPushService: Phone: ${firstTimerEntity.primaryMobileNumber}');
        print('FirstTimerPushService: Current is_pushed_to_server: ${firstTimerEntity.isPushedToServer ? "1" : "0"}');
        
        final success = await _pushSingleFirstTimer(repository, firstTimerEntity);
        
        if (success) {
          successCount++;
          print('FirstTimerPushService: ✅ First timer ${firstTimerEntity.id} marked as pushed (is_pushed_to_server = 1)');
        } else {
          failureCount++;
          print('FirstTimerPushService: ❌ First timer ${firstTimerEntity.id} failed to push (is_pushed_to_server = 0)');
        }
        
        // Add delay between requests to avoid rate limiting (429 errors)
        if (i < unpushedFirstTimers.length - 1) {
          print('FirstTimerPushService: Waiting 1 second before next request...');
          await Future.delayed(const Duration(seconds: 1));
        }
      }

      // Verify final state
      final remainingUnpushed = await repository.getUnpushedFirstTimers();
      
      print('\n========================================');
      print('FirstTimerPushService: SYNC COMPLETED');
      print('FirstTimerPushService: Total processed: ${unpushedFirstTimers.length}');
      print('FirstTimerPushService: Successfully pushed: $successCount');
      print('FirstTimerPushService: Failed: $failureCount');
      print('FirstTimerPushService: Remaining unpushed (is_pushed_to_server = 0): ${remainingUnpushed.length}');
      print('========================================\n');
    } catch (e, stackTrace) {
      print('FirstTimerPushService: FATAL ERROR pushing first timers: $e');
      print('FirstTimerPushService: Stack trace: $stackTrace');
    }
  }

  /// Push a single first timer to server
  Future<bool> _pushSingleFirstTimer(FirstTimerRepository repository, FirstTimerEntity firstTimerEntity) async {
    try {
      print('FirstTimerPushService: Pushing first timer with temp ID: ${firstTimerEntity.tempId}');
      
      // Convert entity to API format
      final apiData = _convertEntityToApiFormat(firstTimerEntity);
      
      // Remove temp_id from API data as server doesn't need it
      apiData.remove('temp_id');
      
      print('FirstTimerPushService: Sending data to API: $apiData');
      
      // Call API to create first timer with retry logic for rate limiting
      final response = await _createFirstTimerWithRetry(apiData);
      
      print('FirstTimerPushService: Response received:');
      print('  - isSuccess: ${response.isSuccess}');
      print('  - message: ${response.message}');
      print('  - data: ${response.data}');
      
      if (response.isSuccess) {
        // Check if it's an "already registered" response
        final message = response.message ?? '';
        if (message.contains('already registered') || message.contains('Already registered')) {
          print('FirstTimerPushService: ℹ️ First timer already exists on server');
          
          // Mark as pushed without server ID since it already exists
          // is_pushed_to_server will be set to 1
          await repository.markAsPushed(firstTimerEntity.id);
          
          print('FirstTimerPushService: ✅ Marked as pushed (already exists on server) - is_pushed_to_server = 1');
          return true;
        }
        
        // Normal success response - extract server ID
        if (response.data != null) {
          final serverId = response.data!['id'] as int?;
          if (serverId == null) {
            final errorMsg = 'Server did not return an ID';
            print('FirstTimerPushService: ❌ FAILED - $errorMsg');
            print('FirstTimerPushService: ❌ Full response data: ${response.data}');
            await repository.updatePushError(firstTimerEntity.id, errorMsg);
            return false;
          }
          
          print('FirstTimerPushService: ✅ SUCCESS - Server ID: $serverId');
          
          // Update local record with server ID and mark as pushed
          // is_pushed_to_server will be set to 1
          await repository.updateWithServerId(firstTimerEntity.id, serverId);
          
          // Verify the update was successful
          final updatedEntity = await repository.findById(firstTimerEntity.id);
          if (updatedEntity != null) {
            print('FirstTimerPushService: ✅ Database verified - is_pushed_to_server: ${updatedEntity.isPushedToServer ? "1 ✓" : "0 ✗"}, serverId: ${updatedEntity.serverId}');
            if (!updatedEntity.isPushedToServer) {
              print('FirstTimerPushService: ⚠️ WARNING - is_pushed_to_server is still 0 after update!');
            }
            return true;
          } else {
            print('FirstTimerPushService: ⚠️ WARNING - Could not find updated entity with ID: ${firstTimerEntity.id}');
            return true; // Still consider it success since API call worked
          }
        } else {
          // Success response but no data
          final errorMsg = 'Success response but no data returned';
          print('FirstTimerPushService: ❌ FAILED - $errorMsg');
          await repository.updatePushError(firstTimerEntity.id, errorMsg);
          return false;
        }
        
      } else {
        // API call was not successful
        final errorMsg = response.message ?? 'Unknown error';
        
        print('FirstTimerPushService: ❌ FAILED - API Error');
        print('FirstTimerPushService: ❌ Response isSuccess: ${response.isSuccess}');
        print('FirstTimerPushService: ❌ Response data type: ${response.data?.runtimeType}');
        
        // Print error message in chunks to avoid truncation
        print('FirstTimerPushService: ❌ Error Message (length: ${errorMsg.length}):');
        final chunkSize = 500;
        for (int i = 0; i < errorMsg.length; i += chunkSize) {
          final end = (i + chunkSize < errorMsg.length) ? i + chunkSize : errorMsg.length;
          print('  Chunk ${(i ~/ chunkSize) + 1}: ${errorMsg.substring(i, end)}');
        }
        
        // Extract short error for storage
        String shortError = errorMsg;
        
        // Check if it's a 429 error
        if (errorMsg.contains('429')) {
          shortError = 'Rate limit exceeded (429). Too many requests.';
          print('FirstTimerPushService: ⚠️ RATE LIMIT detected - Server is rate limiting requests');
        } else if (errorMsg.contains('401')) {
          shortError = 'Authentication failed (401)';
        } else if (errorMsg.contains('403')) {
          shortError = 'Permission denied (403)';
        } else if (errorMsg.contains('422')) {
          shortError = 'Validation failed (422)';
        } else if (errorMsg.contains('500')) {
          shortError = 'Server error (500)';
        } else if (errorMsg.length > 200) {
          shortError = errorMsg.substring(0, 200) + '...';
        }
        
        print('FirstTimerPushService: ❌ Storing error: $shortError');
        
        // Try to log response.data if available
        if (response.data != null) {
          try {
            final dataStr = response.data.toString();
            if (dataStr.length <= 500) {
              print('FirstTimerPushService: ❌ Response data: $dataStr');
            } else {
              print('FirstTimerPushService: ❌ Response data (truncated): ${dataStr.substring(0, 500)}...');
            }
          } catch (e) {
            print('FirstTimerPushService: ❌ Could not parse response data: $e');
          }
        }
        
        await repository.updatePushError(firstTimerEntity.id, shortError);
        return false;
      }
      
    } catch (e, stackTrace) {
      final errorMsg = e.toString();
      print('FirstTimerPushService: ❌ EXCEPTION - Error: $errorMsg');
      print('FirstTimerPushService: ❌ Stack trace: $stackTrace');
      await repository.updatePushError(firstTimerEntity.id, errorMsg);
      return false;
    }
  }

  /// Create first timer with retry logic for rate limiting
  Future<dynamic> _createFirstTimerWithRetry(Map<String, dynamic> apiData, {int maxRetries = 3}) async {
    Exception? lastException;
    dynamic lastResponse;
    
    for (int attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        print('FirstTimerPushService: 🔄 API Call Attempt $attempt/$maxRetries');
        final response = await _apiService.createFirstTimer(apiData);
        lastResponse = response;
        
        // Check if response contains a 429 error (rate limiting)
        if (!response.isSuccess && response.message?.contains('429') == true) {
          print('FirstTimerPushService: ⚠️ Rate limit detected in response (attempt $attempt/$maxRetries)');
          
          if (attempt < maxRetries) {
            final delay = Duration(seconds: attempt * 3); // Exponential backoff (3s, 6s, 9s)
            print('FirstTimerPushService: ⏳ Waiting ${delay.inSeconds}s before retry...');
            await Future.delayed(delay);
            continue; // Retry
          } else {
            print('FirstTimerPushService: ❌ Max retries reached for rate limit');
            return response; // Return the error response
          }
        }
        
        // If no rate limit error, return the response (success or other error)
        print('FirstTimerPushService: ✅ API call completed on attempt $attempt (isSuccess: ${response.isSuccess})');
        return response;
        
      } catch (e, stackTrace) {
        lastException = e as Exception;
        print('FirstTimerPushService: ❌ Attempt $attempt threw exception');
        print('FirstTimerPushService: ❌ Error type: ${e.runtimeType}');
        print('FirstTimerPushService: ❌ Error message: $e');
        
        // Check if it's a rate limiting error (429)
        if (e.toString().contains('429') && attempt < maxRetries) {
          final delay = Duration(seconds: attempt * 3); // Exponential backoff
          print('FirstTimerPushService: ⏳ Rate limited (429) exception, waiting ${delay.inSeconds}s before retry...');
          await Future.delayed(delay);
          continue;
        }
        
        // Check for other common errors
        if (e.toString().contains('401')) {
          print('FirstTimerPushService: ❌ Authentication error (401) - Check API token');
        } else if (e.toString().contains('403')) {
          print('FirstTimerPushService: ❌ Permission error (403) - User may lack permissions');
        } else if (e.toString().contains('422')) {
          print('FirstTimerPushService: ❌ Validation error (422) - Check data format');
        } else if (e.toString().contains('500')) {
          print('FirstTimerPushService: ❌ Server error (500) - Backend issue');
        }
        
        // If it's the last attempt, log and re-throw
        if (attempt == maxRetries) {
          print('FirstTimerPushService: ❌ Max retries ($maxRetries) exceeded');
          print('FirstTimerPushService: ❌ Final error: $lastException');
          print('FirstTimerPushService: ❌ Stack trace: $stackTrace');
          rethrow;
        }
      }
    }
    
    // If we get here, return last response or throw exception
    if (lastResponse != null) {
      return lastResponse;
    }
    throw lastException ?? Exception('Max retries exceeded for first timer creation');
  }

  /// Convert FirstTimerEntity to API format
  Map<String, dynamic> _convertEntityToApiFormat(FirstTimerEntity entity) {
    return {
      'name': entity.name,
      'location': entity.location,
      'primary_mobile_number': entity.primaryMobileNumber,
      'secondary_mobile_number': entity.secondaryMobileNumber,
      'how_was_service': entity.howWasService,
      'is_first_time': entity.isFirstTime,
      'has_permanent_place_of_worship': entity.hasPermanentPlaceOfWorship,
      'invited_by': entity.invitedBy,
      'invited_by_member_id': entity.invitedByMemberId,
      'would_like_to_stay': entity.wouldLikeToStay,
      'event_id': entity.eventId,
      'self_registered': entity.selfRegistered,
      'device_fingerprint': entity.deviceFingerprint,
      'temp_id': entity.tempId, // Include temp ID for reference
    };
  }

  /// Retry failed pushes
  Future<void> retryFailedPushes() async {
    try {
      print('FirstTimerPushService: Retrying failed pushes...');
      
      await _ormDatabaseService.initialize();
      final repository = _ormDatabaseService.getRepository<FirstTimerRepository>();
      
      if (repository == null) {
        print('FirstTimerPushService: FirstTimerRepository not found');
        return;
      }

      // Get first timers with push errors
      final db = await repository.database;
      final List<Map<String, dynamic>> maps = await db.query(
        'first_timers',
        where: 'push_error IS NOT NULL AND is_pushed_to_server = ?',
        whereArgs: [0],
        orderBy: 'last_push_attempt ASC',
      );

      final failedFirstTimers = List.generate(maps.length, (i) => FirstTimerEntity.fromMap(maps[i]));
      print('FirstTimerPushService: Found ${failedFirstTimers.length} failed first timers to retry');

      for (final firstTimerEntity in failedFirstTimers) {
        await _pushSingleFirstTimer(repository, firstTimerEntity);
      }

      print('FirstTimerPushService: Completed retrying failed pushes');
    } catch (e) {
      print('FirstTimerPushService: Error retrying failed pushes: $e');
    }
  }

  /// Get push statistics
  Future<Map<String, int>> getPushStatistics() async {
    try {
      await _ormDatabaseService.initialize();
      final repository = _ormDatabaseService.getRepository<FirstTimerRepository>();
      if (repository == null) {
        return {
          'total': 0,
          'pushed': 0,
          'failed': 0,
          'pending': 0,
        };
      }
      
      final db = await repository.database;
      
      final totalResult = await db.rawQuery('SELECT COUNT(*) as count FROM first_timers');
      final total = totalResult.first['count'] as int;
      
      final pushedResult = await db.rawQuery('SELECT COUNT(*) as count FROM first_timers WHERE is_pushed_to_server = 1');
      final pushed = pushedResult.first['count'] as int;
      
      final failedResult = await db.rawQuery('SELECT COUNT(*) as count FROM first_timers WHERE push_error IS NOT NULL AND is_pushed_to_server = 0');
      final failed = failedResult.first['count'] as int;
      
      final pendingResult = await db.rawQuery('SELECT COUNT(*) as count FROM first_timers WHERE is_pushed_to_server = 0 AND push_error IS NULL');
      final pending = pendingResult.first['count'] as int;
      
      return {
        'total': total,
        'pushed': pushed,
        'failed': failed,
        'pending': pending,
      };
    } catch (e) {
      print('FirstTimerPushService: Error getting push statistics: $e');
      return {
        'total': 0,
        'pushed': 0,
        'failed': 0,
        'pending': 0,
      };
    }
  }

  /// Clear push errors (for testing)
  Future<void> clearPushErrors() async {
    try {
      await _ormDatabaseService.initialize();
      final repository = _ormDatabaseService.getRepository<FirstTimerRepository>();
      if (repository == null) return;
      
      final db = await repository.database;
      
      await db.update(
        'first_timers',
        {
          'push_error': null,
          'push_attempts': 0,
          'last_push_attempt': null,
        },
        where: 'push_error IS NOT NULL',
      );
      
      print('FirstTimerPushService: Cleared all push errors');
    } catch (e) {
      print('FirstTimerPushService: Error clearing push errors: $e');
    }
  }
}
