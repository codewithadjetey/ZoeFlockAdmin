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

  SyncProgress({
    required this.category,
    required this.total,
    required this.synced,
    required this.status,
    this.error,
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
      await _syncGroups();
      
      // Sync Families
      await _syncFamilies();
      
      // Sync Members
      await _syncMembers();
      
      // Sync Events
      await _syncEvents();

      print('SyncService: Full data sync completed successfully');
    } catch (e) {
      print('SyncService: Error during sync: $e');
      success = false;
    } finally {
      _isSyncing = false;
    }

    return success;
  }

  /// Sync groups from the server
  Future<void> _syncGroups() async {
    try {
      print('SyncService: Starting groups sync...');
      
      _progressController.add(SyncProgress(
        category: 'Groups',
        total: 0,
        synced: 0,
        status: 'Fetching groups...',
      ));

      final response = await _apiService.dio.get('/groups');
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        final paginatedData = responseData['data'] as Map<String, dynamic>?;
        
        if (paginatedData != null) {
          final groupsList = paginatedData['data'] as List?;
          
          if (groupsList != null) {
            final total = groupsList.length;
            
            _progressController.add(SyncProgress(
              category: 'Groups',
              total: total,
              synced: 0,
              status: 'Processing groups...',
            ));

            // Store groups in local database
            for (int i = 0; i < groupsList.length; i++) {
              final groupData = groupsList[i];
              
              // Store group data in settings table
              await _databaseService.setSetting(
                'group_${groupData['id']}', 
                groupData.toString()
              );
              
              _progressController.add(SyncProgress(
                category: 'Groups',
                total: total,
                synced: i + 1,
                status: 'Syncing groups...',
              ));
            }

            _progressController.add(SyncProgress(
              category: 'Groups',
              total: total,
              synced: total,
              status: 'Groups synced successfully',
            ));
          }
        }
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

  /// Sync families from the server
  Future<void> _syncFamilies() async {
    try {
      print('SyncService: Starting families sync...');
      
      _progressController.add(SyncProgress(
        category: 'Families',
        total: 0,
        synced: 0,
        status: 'Fetching families...',
      ));

      final response = await _apiService.dio.get('/families');
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        final paginatedData = responseData['data'] as Map<String, dynamic>?;
        
        if (paginatedData != null) {
          final familiesList = paginatedData['data'] as List?;
          
          if (familiesList != null) {
            final total = familiesList.length;
            
            _progressController.add(SyncProgress(
              category: 'Families',
              total: total,
              synced: 0,
              status: 'Processing families...',
            ));

            // Store families in local database
            for (int i = 0; i < familiesList.length; i++) {
              final familyData = familiesList[i];
              
              // Store family data in settings table
              await _databaseService.setSetting(
                'family_${familyData['id']}', 
                familyData.toString()
              );
              
              _progressController.add(SyncProgress(
                category: 'Families',
                total: total,
                synced: i + 1,
                status: 'Syncing families...',
              ));
            }

            _progressController.add(SyncProgress(
              category: 'Families',
              total: total,
              synced: total,
              status: 'Families synced successfully',
            ));
          }
        }
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

  /// Sync members from the server
  Future<void> _syncMembers() async {
    try {
      print('SyncService: Starting members sync...');
      
      _progressController.add(SyncProgress(
        category: 'Members',
        total: 0,
        synced: 0,
        status: 'Fetching members...',
      ));

      final response = await _apiService.dio.get('/members');
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        final paginatedData = responseData['data'] as Map<String, dynamic>?;
        
        if (paginatedData != null) {
          final membersList = paginatedData['data'] as List?;
          
          if (membersList != null) {
            final total = membersList.length;
            
            _progressController.add(SyncProgress(
              category: 'Members',
              total: total,
              synced: 0,
              status: 'Processing members...',
            ));

            // Convert to Member objects and store in database
            final members = <Member>[];
            for (int i = 0; i < membersList.length; i++) {
              final memberData = membersList[i];
              
              try {
                final member = Member.fromJson(memberData);
                members.add(member);
                
                _progressController.add(SyncProgress(
                  category: 'Members',
                  total: total,
                  synced: i + 1,
                  status: 'Syncing members...',
                ));
              } catch (e) {
                print('SyncService: Error parsing member ${memberData['id']}: $e');
              }
            }

            // Bulk insert members
            if (members.isNotEmpty) {
              await _databaseService.insertMembers(members);
            }

            _progressController.add(SyncProgress(
              category: 'Members',
              total: total,
              synced: total,
              status: 'Members synced successfully',
            ));
          }
        }
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
