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
  Future<void> pushUnpushedFirstTimers() async {
    try {
      print('FirstTimerPushService: Starting to push unpushed first timers...');
      
      await _ormDatabaseService.initialize();
      final repository = _ormDatabaseService.getRepository<FirstTimerRepository>();
      
      if (repository == null) {
        print('FirstTimerPushService: FirstTimerRepository not found');
        return;
      }

      final unpushedFirstTimers = await repository.getUnpushedFirstTimers();
      print('FirstTimerPushService: Found ${unpushedFirstTimers.length} unpushed first timers');

      for (final firstTimerEntity in unpushedFirstTimers) {
        await _pushSingleFirstTimer(repository, firstTimerEntity);
      }

      print('FirstTimerPushService: Completed pushing first timers');
    } catch (e) {
      print('FirstTimerPushService: Error pushing first timers: $e');
    }
  }

  /// Push a single first timer to server
  Future<void> _pushSingleFirstTimer(FirstTimerRepository repository, FirstTimerEntity firstTimerEntity) async {
    try {
      print('FirstTimerPushService: Pushing first timer with temp ID: ${firstTimerEntity.tempId}');
      
      // Convert entity to API format
      final apiData = _convertEntityToApiFormat(firstTimerEntity);
      
      // Remove temp_id from API data as server doesn't need it
      apiData.remove('temp_id');
      
      print('FirstTimerPushService: Sending data to API: $apiData');
      
      // Call API to create first timer
      final response = await _apiService.createFirstTimer(apiData);
      
      if (response.isSuccess && response.data != null) {
        // Extract server ID from response
        final serverId = response.data!['id'] as int;
        print('FirstTimerPushService: Successfully pushed first timer, server ID: $serverId');
        
        // Update local record with server ID and mark as pushed
        await repository.updateWithServerId(firstTimerEntity.id, serverId);
        
      } else {
        print('FirstTimerPushService: Failed to push first timer: ${response.message}');
        await repository.updatePushError(firstTimerEntity.id, response.message ?? 'Unknown error');
      }
      
    } catch (e) {
      print('FirstTimerPushService: Error pushing single first timer: $e');
      await repository.updatePushError(firstTimerEntity.id, e.toString());
    }
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
