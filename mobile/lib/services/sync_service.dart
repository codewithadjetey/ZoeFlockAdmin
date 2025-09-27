import 'dart:async';
import 'package:dio/dio.dart';
import '../models/api_response.dart';
import '../models/member.dart';
import '../models/event.dart';
import '../utils/constants.dart';
import 'api_service.dart';
import 'database_service.dart';

class SyncProgress {
  final String category;
  final int total;
  final int synced;
  final String status;
  final String? error;
  final int currentPage;
  final int totalPages;

  SyncProgress({
    required this.category,
    required this.total,
    required this.synced,
    required this.status,
    this.error,
    this.currentPage = 1,
    this.totalPages = 1,
  });

  double get progress => total > 0 ? synced / total : 0.0;
  bool get isComplete => synced >= total;
  bool get hasError => error != null;
}

class SyncService {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;
  SyncService._internal();

  final ApiService _apiService = ApiService();
  final DatabaseService _databaseService = DatabaseService();
  
  final StreamController<SyncProgress> _progressController = StreamController<SyncProgress>.broadcast();
  Stream<SyncProgress> get progressStream => _progressController.stream;

  bool _isSyncing = false;
  bool get isSyncing => _isSyncing;

  /// Test member API connection
  Future<void> testMemberApi() async {
    try {
      print('SyncService: Testing member API connection...');
      final response = await _apiService.getAllMembers(page: 1, perPage: 1);
      
      print('SyncService: Test API response success: ${response.isSuccess}');
      print('SyncService: Test API response error: ${response.errorMessage}');
      print('SyncService: Test API response data: ${response.data}');
      
      if (response.isSuccess) {
        print('SyncService: Member API test successful');
      } else {
        print('SyncService: Member API test failed: ${response.errorMessage}');
      }
    } catch (e) {
      print('SyncService: Member API test error: $e');
    }
  }

  /// Sync only members (for testing)
  Future<bool> syncMembersOnly() async {
    if (_isSyncing) {
      print('SyncService: Sync already in progress');
      return false;
    }

    _isSyncing = true;
    bool success = true;

    try {
      print('SyncService: Starting members-only sync...');
      await _syncMembers();
      print('SyncService: Members-only sync completed successfully');
    } catch (e) {
      print('SyncService: Error during members-only sync: $e');
      success = false;
    } finally {
      _isSyncing = false;
    }

    return success;
  }

  /// Start the sync process for all data
  Future<bool> syncAllData() async {
    if (_isSyncing) {
      print('SyncService: Sync already in progress');
      return false;
    }

    _isSyncing = true;
    bool success = true;

    try {
      print('SyncService: Starting full data sync...');

      // Sync Groups
      print('SyncService: Starting Groups sync...');
      await _syncGroups();
      print('SyncService: Groups sync completed');
      
      // Sync Families
      print('SyncService: Starting Families sync...');
      await _syncFamilies();
      print('SyncService: Families sync completed');
      
      // Sync Members
      print('SyncService: Starting Members sync...');
      await _syncMembers();
      print('SyncService: Members sync completed');
      
      // Sync Events
      print('SyncService: Starting Events sync...');
      await _syncEvents();
      print('SyncService: Events sync completed');

      print('SyncService: Full data sync completed successfully');
    } catch (e) {
      print('SyncService: Error during sync: $e');
      print('SyncService: Stack trace: ${StackTrace.current}');
      success = false;
    } finally {
      _isSyncing = false;
    }

    return success;
  }

  /// Sync groups from the server with pagination
  Future<void> _syncGroups() async {
    try {
      print('SyncService: Starting groups sync...');
      
      _progressController.add(SyncProgress(
        category: 'Groups',
        total: 0,
        synced: 0,
        status: 'Fetching groups...',
      ));

      // First, get total count
      final countResponse = await _apiService.dio.get('/groups', queryParameters: {
        'per_page': 1,
        'page': 1,
      });
      
      if (countResponse.statusCode == 200) {
        final responseData = countResponse.data;
        final paginatedData = responseData['data'] as Map<String, dynamic>?;
        final total = paginatedData?['total'] as int? ?? 0;
        final totalPages = (total / 100).ceil();
        
        _progressController.add(SyncProgress(
          category: 'Groups',
          total: total,
          synced: 0,
          status: 'Processing groups...',
          totalPages: totalPages,
        ));

        int syncedCount = 0;
        
        // Fetch all pages
        for (int page = 1; page <= totalPages; page++) {
          _progressController.add(SyncProgress(
            category: 'Groups',
            total: total,
            synced: syncedCount,
            status: 'Fetching page $page of $totalPages...',
            currentPage: page,
            totalPages: totalPages,
          ));

          final response = await _apiService.dio.get('/groups', queryParameters: {
            'per_page': 100,
            'page': page,
          });
          
          if (response.statusCode == 200) {
            final responseData = response.data;
            final paginatedData = responseData['data'] as Map<String, dynamic>?;
            final groupsList = paginatedData?['data'] as List?;
            
            if (groupsList != null) {
              // Store groups in local database
              for (final groupData in groupsList) {
                await _databaseService.setSetting(
                  'group_${groupData['id']}', 
                  groupData.toString()
                );
                syncedCount++;
              }
              
              _progressController.add(SyncProgress(
                category: 'Groups',
                total: total,
                synced: syncedCount,
                status: 'Syncing groups...',
                currentPage: page,
                totalPages: totalPages,
              ));
            }
          }
        }

        _progressController.add(SyncProgress(
          category: 'Groups',
          total: total,
          synced: syncedCount,
          status: 'Groups synced successfully',
          currentPage: totalPages,
          totalPages: totalPages,
        ));
      }
    } catch (e) {
      print('SyncService: Error syncing groups: $e');
      _progressController.add(SyncProgress(
        category: 'Groups',
        total: 0,
        synced: 0,
        status: 'Error syncing groups',
        error: e.toString(),
      ));
      rethrow;
    }
  }

  /// Sync families from the server with pagination
  Future<void> _syncFamilies() async {
    try {
      print('SyncService: Starting families sync...');
      
      _progressController.add(SyncProgress(
        category: 'Families',
        total: 0,
        synced: 0,
        status: 'Fetching families...',
      ));

      // First, get total count
      final countResponse = await _apiService.dio.get('/families', queryParameters: {
        'per_page': 1,
        'page': 1,
      });
      
      if (countResponse.statusCode == 200) {
        final responseData = countResponse.data;
        final paginatedData = responseData['data'] as Map<String, dynamic>?;
        final total = paginatedData?['total'] as int? ?? 0;
        final totalPages = (total / 100).ceil();
        
        _progressController.add(SyncProgress(
          category: 'Families',
          total: total,
          synced: 0,
          status: 'Processing families...',
          totalPages: totalPages,
        ));

        int syncedCount = 0;
        
        // Fetch all pages
        for (int page = 1; page <= totalPages; page++) {
          _progressController.add(SyncProgress(
            category: 'Families',
            total: total,
            synced: syncedCount,
            status: 'Fetching page $page of $totalPages...',
            currentPage: page,
            totalPages: totalPages,
          ));

          final response = await _apiService.dio.get('/families', queryParameters: {
            'per_page': 100,
            'page': page,
          });
          
          if (response.statusCode == 200) {
            final responseData = response.data;
            final paginatedData = responseData['data'] as Map<String, dynamic>?;
            final familiesList = paginatedData?['data'] as List?;
            
            if (familiesList != null) {
              // Store families in local database
              for (final familyData in familiesList) {
                await _databaseService.setSetting(
                  'family_${familyData['id']}', 
                  familyData.toString()
                );
                syncedCount++;
              }
              
              _progressController.add(SyncProgress(
                category: 'Families',
                total: total,
                synced: syncedCount,
                status: 'Syncing families...',
                currentPage: page,
                totalPages: totalPages,
              ));
            }
          }
        }

        _progressController.add(SyncProgress(
          category: 'Families',
          total: total,
          synced: syncedCount,
          status: 'Families synced successfully',
          currentPage: totalPages,
          totalPages: totalPages,
        ));
      }
    } catch (e) {
      print('SyncService: Error syncing families: $e');
      _progressController.add(SyncProgress(
        category: 'Families',
        total: 0,
        synced: 0,
        status: 'Error syncing families',
        error: e.toString(),
      ));
      rethrow;
    }
  }

  /// Sync members from the server with pagination
  Future<void> _syncMembers() async {
    try {
      print('SyncService: Starting members sync...');
      
      _progressController.add(SyncProgress(
        category: 'Members',
        total: 0,
        synced: 0,
        status: 'Fetching members...',
        currentPage: 1,
        totalPages: 1,
      ));

      // First, get total count
      print('SyncService: Getting members count...');
      final countResponse = await _apiService.getAllMembers(page: 1, perPage: 1);
      
      print('SyncService: Members count response success: ${countResponse.isSuccess}');
      print('SyncService: Members count error message: ${countResponse.errorMessage}');
      print('SyncService: Members count response data: ${countResponse.data}');
      
      if (countResponse.isSuccess && countResponse.data != null) {
        final paginatedData = countResponse.data!;
        print('SyncService: Members count response data: $paginatedData');
        
        // Handle different response structures
        int total = 0;
        if (paginatedData.containsKey('total')) {
          total = paginatedData['total'] as int? ?? 0;
        } else if (paginatedData.containsKey('last_page')) {
          // Calculate total from last_page and per_page
          final lastPage = paginatedData['last_page'] as int? ?? 1;
          final perPage = paginatedData['per_page'] as int? ?? 100;
          total = lastPage * perPage;
        }
        
        final totalPages = (total / 100).ceil();
        
        print('SyncService: Members total: $total, totalPages: $totalPages');
        
        if (total == 0) {
          print('SyncService: No members found in backend');
          _progressController.add(SyncProgress(
            category: 'Members',
            total: 0,
            synced: 0,
            status: 'No members found',
            currentPage: 1,
            totalPages: 1,
          ));
          return;
        }
        
        _progressController.add(SyncProgress(
          category: 'Members',
          total: total,
          synced: 0,
          status: 'Processing members...',
          totalPages: totalPages,
        ));

        int syncedCount = 0;
        final allMembers = <Member>[];
        
        // Fetch all pages
        for (int page = 1; page <= totalPages; page++) {
          _progressController.add(SyncProgress(
            category: 'Members',
            total: total,
            synced: syncedCount,
            status: 'Fetching page $page of $totalPages...',
            currentPage: page,
            totalPages: totalPages,
          ));

          final response = await _apiService.getAllMembers(page: page, perPage: 100);
          
          if (response.isSuccess && response.data != null) {
            final paginatedData = response.data!;
            final membersList = paginatedData['data'] as List?;
            
            print('SyncService: Page $page - Found ${membersList?.length ?? 0} members');
            
            if (membersList != null) {
              // Convert to Member objects
              for (final memberData in membersList) {
                try {
                  final member = Member.fromJson(memberData);
                  allMembers.add(member);
                  syncedCount++;
                } catch (e) {
                  print('SyncService: Error parsing member ${memberData['id']}: $e');
                }
              }
              
              _progressController.add(SyncProgress(
                category: 'Members',
                total: total,
                synced: syncedCount,
                status: 'Syncing members...',
                currentPage: page,
                totalPages: totalPages,
              ));
            }
          } else {
            print('SyncService: Error fetching members page $page: ${response.errorMessage}');
          }
        }

        // Clear existing members and bulk insert new ones
        if (allMembers.isNotEmpty) {
          _progressController.add(SyncProgress(
            category: 'Members',
            total: total,
            synced: syncedCount,
            status: 'Clearing existing members...',
            currentPage: totalPages,
            totalPages: totalPages,
          ));
          
          // Clear existing members
          await _databaseService.clearAllMembers();
          
          _progressController.add(SyncProgress(
            category: 'Members',
            total: total,
            synced: syncedCount,
            status: 'Saving members to database...',
            currentPage: totalPages,
            totalPages: totalPages,
          ));
          
          // Bulk insert new members
          await _databaseService.insertMembers(allMembers);
        }

        _progressController.add(SyncProgress(
          category: 'Members',
          total: total,
          synced: syncedCount,
          status: 'Members synced successfully',
          currentPage: totalPages,
          totalPages: totalPages,
        ));
      } else {
        print('SyncService: Failed to get members count - API call failed');
        _progressController.add(SyncProgress(
          category: 'Members',
          total: 0,
          synced: 0,
          status: 'Failed to fetch members',
          error: countResponse.errorMessage ?? 'Unknown error',
        ));
        throw Exception('Failed to fetch members: ${countResponse.errorMessage}');
      }
    } catch (e) {
      print('SyncService: Error syncing members: $e');
      _progressController.add(SyncProgress(
        category: 'Members',
        total: 0,
        synced: 0,
        status: 'Error syncing members',
        error: e.toString(),
      ));
      rethrow;
    }
  }

  /// Sync events from the server
  Future<void> _syncEvents() async {
    try {
      print('SyncService: Starting events sync...');
      
      _progressController.add(SyncProgress(
        category: 'Events',
        total: 0,
        synced: 0,
        status: 'Fetching events...',
      ));

      final response = await _apiService.dio.get('/events');
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        final paginatedData = responseData['data'] as Map<String, dynamic>?;
        
        if (paginatedData != null) {
          final eventsList = paginatedData['data'] as List?;
          
          if (eventsList != null) {
            final total = eventsList.length;
            
            _progressController.add(SyncProgress(
              category: 'Events',
              total: total,
              synced: 0,
              status: 'Processing events...',
            ));

            // Convert to Event objects and store in database
            final events = <Event>[];
            for (int i = 0; i < eventsList.length; i++) {
              final eventData = eventsList[i];
              
              try {
                final event = Event.fromJson(eventData);
                events.add(event);
                
                _progressController.add(SyncProgress(
                  category: 'Events',
                  total: total,
                  synced: i + 1,
                  status: 'Syncing events...',
                ));
              } catch (e) {
                print('SyncService: Error parsing event ${eventData['id']}: $e');
              }
            }

            // Bulk insert events
            if (events.isNotEmpty) {
              await _databaseService.insertEvents(events);
            }

            _progressController.add(SyncProgress(
              category: 'Events',
              total: total,
              synced: total,
              status: 'Events synced successfully',
            ));
          }
        }
      }
    } catch (e) {
      print('SyncService: Error syncing events: $e');
      _progressController.add(SyncProgress(
        category: 'Events',
        total: 0,
        synced: 0,
        status: 'Error syncing events',
        error: e.toString(),
      ));
      rethrow;
    }
  }

  /// Get synced groups from local storage
  Future<List<Map<String, dynamic>>> getSyncedGroups() async {
    try {
      final settings = await _databaseService.getAllSettings();
      final groups = <Map<String, dynamic>>[];
      
      for (final entry in settings.entries) {
        if (entry.key.startsWith('group_')) {
          // Parse the stored group data
          // Note: This is a simplified approach. In a real app, you'd want proper JSON serialization
          try {
            // For now, we'll return empty list as we need proper JSON handling
            // groups.add(jsonDecode(entry.value));
          } catch (e) {
            print('SyncService: Error parsing group data: $e');
          }
        }
      }
      
      return groups;
    } catch (e) {
      print('SyncService: Error getting synced groups: $e');
      return [];
    }
  }

  /// Get synced families from local storage
  Future<List<Map<String, dynamic>>> getSyncedFamilies() async {
    try {
      final settings = await _databaseService.getAllSettings();
      final families = <Map<String, dynamic>>[];
      
      for (final entry in settings.entries) {
        if (entry.key.startsWith('family_')) {
          // Parse the stored family data
          // Note: This is a simplified approach. In a real app, you'd want proper JSON serialization
          try {
            // For now, we'll return empty list as we need proper JSON handling
            // families.add(jsonDecode(entry.value));
          } catch (e) {
            print('SyncService: Error parsing family data: $e');
          }
        }
      }
      
      return families;
    } catch (e) {
      print('SyncService: Error getting synced families: $e');
      return [];
    }
  }

  /// Get synced members from local storage
  Future<List<Member>> getSyncedMembers() async {
    try {
      return await _databaseService.getAllMembers();
    } catch (e) {
      print('SyncService: Error getting synced members: $e');
      return [];
    }
  }

  /// Get synced events from local storage
  Future<List<Event>> getSyncedEvents() async {
    try {
      return await _databaseService.getAllEvents();
    } catch (e) {
      print('SyncService: Error getting synced events: $e');
      return [];
    }
  }

  /// Clear all synced data
  Future<void> clearSyncedData() async {
    try {
      await _databaseService.clearAllData();
      print('SyncService: All synced data cleared');
    } catch (e) {
      print('SyncService: Error clearing synced data: $e');
      rethrow;
    }
  }

  /// Get sync status
  Future<Map<String, int>> getSyncStatus() async {
    try {
      final members = await _databaseService.getAllMembers();
      final events = await _databaseService.getAllEvents();
      final settings = await _databaseService.getAllSettings();
      
      int groupsCount = 0;
      int familiesCount = 0;
      
      for (final key in settings.keys) {
        if (key.startsWith('group_')) groupsCount++;
        if (key.startsWith('family_')) familiesCount++;
      }
      
      return {
        'members': members.length,
        'events': events.length,
        'groups': groupsCount,
        'families': familiesCount,
      };
    } catch (e) {
      print('SyncService: Error getting sync status: $e');
      return {
        'members': 0,
        'events': 0,
        'groups': 0,
        'families': 0,
      };
    }
  }

  void dispose() {
    _progressController.close();
  }
}
