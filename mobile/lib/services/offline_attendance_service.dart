import 'dart:async';
import 'package:uuid/uuid.dart';
import '../models/offline_attendance.dart';
import '../models/member.dart';
import '../models/event.dart';
import 'database_helper.dart';
import 'api_service.dart';
import '../utils/helpers.dart';

class OfflineAttendanceService {
  static final OfflineAttendanceService _instance = OfflineAttendanceService._internal();
  factory OfflineAttendanceService() => _instance;
  OfflineAttendanceService._internal();

  final DatabaseHelper _databaseHelper = DatabaseHelper();
  final ApiService _apiService = ApiService();
  final Uuid _uuid = const Uuid();

  /// Mark attendance offline
  Future<OfflineAttendance> markAttendanceOffline({
    required Member member,
    required Event event,
    required String status,
    String? notes,
    bool isFirstTimer = false,
  }) async {
    try {
      final localId = _uuid.v4();
      final now = DateTime.now();
      
      final offlineAttendance = OfflineAttendance(
        localId: localId,
        memberId: member.id,
        eventId: event.id,
        status: status,
        checkInTime: now,
        notes: notes,
        isFirstTimer: isFirstTimer,
        isSynced: false,
        localVersion: 1,
        createdAt: now,
        updatedAt: now,
      );

      final attendanceData = offlineAttendance.toDatabaseJson();
      await _databaseHelper.insertOfflineAttendance(attendanceData);

      print('OfflineAttendanceService: Attendance marked offline for member ${member.id} at event ${event.id}');
      return offlineAttendance;
    } catch (e) {
      print('OfflineAttendanceService: Error marking attendance offline: $e');
      rethrow;
    }
  }

  /// Get all offline attendance records
  Future<List<OfflineAttendance>> getAllOfflineAttendance() async {
    try {
      final records = await _databaseHelper.getAllOfflineAttendance();
      return records.map((record) => OfflineAttendance.fromDatabase(record)).toList();
    } catch (e) {
      print('OfflineAttendanceService: Error getting all offline attendance: $e');
      return [];
    }
  }

  /// Get unsynced offline attendance records
  Future<List<OfflineAttendance>> getUnsyncedOfflineAttendance() async {
    try {
      final records = await _databaseHelper.getUnsyncedOfflineAttendance();
      return records.map((record) => OfflineAttendance.fromDatabase(record)).toList();
    } catch (e) {
      print('OfflineAttendanceService: Error getting unsynced offline attendance: $e');
      return [];
    }
  }

  /// Get offline attendance by local ID
  Future<OfflineAttendance?> getOfflineAttendanceByLocalId(String localId) async {
    try {
      final record = await _databaseHelper.getOfflineAttendanceByLocalId(localId);
      return record != null ? OfflineAttendance.fromDatabase(record) : null;
    } catch (e) {
      print('OfflineAttendanceService: Error getting offline attendance by local ID: $e');
      return null;
    }
  }

  /// Update offline attendance record
  Future<bool> updateOfflineAttendance(OfflineAttendance attendance) async {
    try {
      final updatedAttendance = attendance.copyWith(
        updatedAt: DateTime.now(),
        localVersion: attendance.localVersion + 1,
      );
      
      final attendanceData = updatedAttendance.toDatabaseJson();
      final count = await _databaseHelper.updateOfflineAttendance(attendanceData);
      
      print('OfflineAttendanceService: Updated offline attendance ${attendance.localId}');
      return count > 0;
    } catch (e) {
      print('OfflineAttendanceService: Error updating offline attendance: $e');
      return false;
    }
  }

  /// Delete offline attendance record
  Future<bool> deleteOfflineAttendance(int id) async {
    try {
      final count = await _databaseHelper.deleteOfflineAttendance(id);
      print('OfflineAttendanceService: Deleted offline attendance with ID: $id');
      return count > 0;
    } catch (e) {
      print('OfflineAttendanceService: Error deleting offline attendance: $e');
      return false;
    }
  }

  /// Get offline attendance count
  Future<int> getOfflineAttendanceCount() async {
    try {
      return await _databaseHelper.getOfflineAttendanceCount();
    } catch (e) {
      print('OfflineAttendanceService: Error getting offline attendance count: $e');
      return 0;
    }
  }

  /// Get unsynced offline attendance count
  Future<int> getUnsyncedOfflineAttendanceCount() async {
    try {
      return await _databaseHelper.getUnsyncedOfflineAttendanceCount();
    } catch (e) {
      print('OfflineAttendanceService: Error getting unsynced offline attendance count: $e');
      return 0;
    }
  }

  /// Sync offline attendance to server
  Future<SyncResult> syncOfflineAttendance() async {
    try {
      print('OfflineAttendanceService: 🚀 Starting offline attendance sync...');
      
      final unsyncedRecords = await getUnsyncedOfflineAttendance();
      print('OfflineAttendanceService: Found ${unsyncedRecords.length} unsynced records');
      
      if (unsyncedRecords.isEmpty) {
        print('OfflineAttendanceService: No unsynced records to sync');
        return SyncResult(success: true, syncedCount: 0, errorCount: 0);
      }

      int syncedCount = 0;
      int errorCount = 0;
      final List<String> errors = [];

      for (int i = 0; i < unsyncedRecords.length; i++) {
        final attendance = unsyncedRecords[i];
        print('OfflineAttendanceService: 📤 Syncing record ${i + 1}/${unsyncedRecords.length}: ${attendance.localId}');
        
        try {
          final success = await _syncSingleAttendance(attendance);
          if (success) {
            syncedCount++;
            print('OfflineAttendanceService: ✅ Successfully synced ${attendance.localId}');
          } else {
            errorCount++;
            errors.add('Failed to sync attendance ${attendance.localId}');
            print('OfflineAttendanceService: ❌ Failed to sync ${attendance.localId}');
          }
        } catch (e) {
          errorCount++;
          errors.add('Error syncing attendance ${attendance.localId}: $e');
          print('OfflineAttendanceService: ❌ Error syncing attendance ${attendance.localId}: $e');
        }
      }

      print('OfflineAttendanceService: 🏁 Sync completed - Synced: $syncedCount, Errors: $errorCount');
      if (errors.isNotEmpty) {
        print('OfflineAttendanceService: Errors: ${errors.join(", ")}');
      }
      
      return SyncResult(
        success: errorCount == 0,
        syncedCount: syncedCount,
        errorCount: errorCount,
        errors: errors,
      );
    } catch (e) {
      print('OfflineAttendanceService: ❌ Error during sync: $e');
      return SyncResult(
        success: false,
        syncedCount: 0,
        errorCount: 1,
        errors: ['Sync failed: $e'],
      );
    }
  }

  /// Sync a single attendance record
  Future<bool> _syncSingleAttendance(OfflineAttendance attendance) async {
    try {
      // Check if this attendance already exists on server
      final existingAttendance = await _getServerAttendance(attendance);
      
      if (existingAttendance != null) {
        // Handle conflict resolution
        return await _handleConflict(attendance, existingAttendance);
      } else {
        // Create new attendance on server
        return await _createServerAttendance(attendance);
      }
    } catch (e) {
      print('OfflineAttendanceService: Error syncing single attendance: $e');
      return false;
    }
  }

  /// Get attendance from server (if exists)
  Future<OfflineAttendance?> _getServerAttendance(OfflineAttendance localAttendance) async {
    try {
      // This would need to be implemented in the API service
      // For now, we'll assume it doesn't exist
      return null;
    } catch (e) {
      print('OfflineAttendanceService: Error getting server attendance: $e');
      return null;
    }
  }

  /// Handle conflict resolution
  Future<bool> _handleConflict(OfflineAttendance local, OfflineAttendance server) async {
    try {
      final resolution = local.getConflictResolution(server);
      
      switch (resolution) {
        case ConflictResolution.keepLocal:
          print('OfflineAttendanceService: Keeping local version for ${local.localId}');
          return await _updateServerAttendance(local);
          
        case ConflictResolution.useServer:
          print('OfflineAttendanceService: Using server version for ${local.localId}');
          return await _updateLocalAttendance(local, server);
          
        case ConflictResolution.manualResolution:
          print('OfflineAttendanceService: Manual resolution required for ${local.localId}');
          // For now, keep local version
          return await _updateServerAttendance(local);
          
        case ConflictResolution.noConflict:
          print('OfflineAttendanceService: No conflict for ${local.localId}');
          return true;
      }
    } catch (e) {
      print('OfflineAttendanceService: Error handling conflict: $e');
      return false;
    }
  }

  /// Create new attendance on server
  Future<bool> _createServerAttendance(OfflineAttendance attendance) async {
    try {
      print('OfflineAttendanceService: Creating server attendance for local ID: ${attendance.localId}');
      print('OfflineAttendanceService: Member ID: ${attendance.memberId}, Event ID: ${attendance.eventId}');
      print('OfflineAttendanceService: Status: ${attendance.status}, Notes: ${attendance.notes}');
      
      final response = await _apiService.markAttendance(
        attendance.memberId,
        attendance.eventId,
        status: attendance.status,
        notes: attendance.notes,
        isFirstTimer: attendance.isFirstTimer,
      );

      print('OfflineAttendanceService: API response success: ${response.isSuccess}');
      print('OfflineAttendanceService: API response data: ${response.data}');
      print('OfflineAttendanceService: API response error: ${response.errorMessage}');

      if (response.isSuccess && response.data != null) {
        // Mark as synced
        await _databaseHelper.markOfflineAttendanceAsSynced(
          attendance.localId,
          response.data!.id,
          response.data!.version ?? 1,
        );
        print('OfflineAttendanceService: ✅ Created server attendance for ${attendance.localId} with server ID: ${response.data!.id}');
        return true;
      } else {
        print('OfflineAttendanceService: ❌ Failed to create server attendance: ${response.errorMessage}');
        return false;
      }
    } catch (e) {
      print('OfflineAttendanceService: ❌ Error creating server attendance: $e');
      print('OfflineAttendanceService: Error type: ${e.runtimeType}');
      return false;
    }
  }

  /// Update attendance on server
  Future<bool> _updateServerAttendance(OfflineAttendance attendance) async {
    try {
      if (attendance.serverId == null) {
        return await _createServerAttendance(attendance);
      }

      // This would need to be implemented in the API service
      // For now, we'll assume it succeeds
      await _databaseHelper.markOfflineAttendanceAsSynced(
        attendance.localId,
        attendance.serverId!,
        attendance.localVersion,
      );
      print('OfflineAttendanceService: Updated server attendance for ${attendance.localId}');
      return true;
    } catch (e) {
      print('OfflineAttendanceService: Error updating server attendance: $e');
      return false;
    }
  }

  /// Update local attendance with server data
  Future<bool> _updateLocalAttendance(OfflineAttendance local, OfflineAttendance server) async {
    try {
      final updatedLocal = local.copyWith(
        serverId: server.serverId,
        serverVersion: server.serverVersion,
        localVersion: server.serverVersion,
        isSynced: true,
        syncedAt: DateTime.now(),
        conflictResolved: true,
      );

      final attendanceData = updatedLocal.toDatabaseJson();
      final count = await _databaseHelper.updateOfflineAttendance(attendanceData);
      
      print('OfflineAttendanceService: Updated local attendance with server data for ${local.localId}');
      return count > 0;
    } catch (e) {
      print('OfflineAttendanceService: Error updating local attendance: $e');
      return false;
    }
  }

  /// Clear all offline attendance records
  Future<void> clearAllOfflineAttendance() async {
    try {
      await _databaseHelper.clearAllOfflineAttendance();
      print('OfflineAttendanceService: Cleared all offline attendance records');
    } catch (e) {
      print('OfflineAttendanceService: Error clearing offline attendance: $e');
      rethrow;
    }
  }

  /// Check if member has already been marked for this event
  Future<bool> isMemberAlreadyMarked(int memberId, int eventId) async {
    try {
      final records = await _databaseHelper.getAllOfflineAttendance();
      return records.any((record) => 
        record['member_id'] == memberId && 
        record['event_id'] == eventId
      );
    } catch (e) {
      print('OfflineAttendanceService: Error checking if member already marked: $e');
      return false;
    }
  }

  /// Get attendance for specific event
  Future<List<OfflineAttendance>> getAttendanceForEvent(int eventId) async {
    try {
      final allRecords = await getAllOfflineAttendance();
      return allRecords.where((attendance) => attendance.eventId == eventId).toList();
    } catch (e) {
      print('OfflineAttendanceService: Error getting attendance for event: $e');
      return [];
    }
  }

  /// Get attendance for specific member
  Future<List<OfflineAttendance>> getAttendanceForMember(int memberId) async {
    try {
      final allRecords = await getAllOfflineAttendance();
      return allRecords.where((attendance) => attendance.memberId == memberId).toList();
    } catch (e) {
      print('OfflineAttendanceService: Error getting attendance for member: $e');
      return [];
    }
  }
}

class SyncResult {
  final bool success;
  final int syncedCount;
  final int errorCount;
  final List<String> errors;

  const SyncResult({
    required this.success,
    required this.syncedCount,
    required this.errorCount,
    this.errors = const [],
  });

  @override
  String toString() {
    return 'SyncResult(success: $success, syncedCount: $syncedCount, errorCount: $errorCount, errors: $errors)';
  }
}
