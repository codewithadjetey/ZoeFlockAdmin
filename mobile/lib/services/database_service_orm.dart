import 'dart:async';
import '../orm/orm_database_service.dart';
import '../orm/orm_service.dart';
import '../orm/entities/settings_entity.dart';
import '../orm/entities/member_entity.dart';
import '../orm/entities/event_entity.dart';
import '../orm/entities/attendance_entity.dart';
import '../models/member.dart';
import '../models/event.dart';
import '../models/attendance.dart';
import '../utils/constants.dart';

/// Database Service that uses ORM for all database operations
/// This is a replacement for the original DatabaseService that provides
/// the same interface but uses the ORM layer underneath
class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  final OrmDatabaseService _ormService = OrmDatabaseService();
  bool _isInitialized = false;

  /// Initialize the database service
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      print('DatabaseService: Initializing with ORM...');
      await _ormService.initialize();
      _isInitialized = true;
      print('DatabaseService: ORM-based database service initialized successfully');
    } catch (e) {
      print('DatabaseService: Error initializing ORM-based database service: $e');
      _isInitialized = true; // Set to true to prevent infinite retry
    }
  }

  Future<dynamic> get database async {
    if (!_isInitialized) {
      await initialize();
    }
    
    // Return a mock database object for compatibility
    // The ORM service handles the actual database operations
    return _MockDatabase();
  }

  // ========== MEMBER OPERATIONS ==========

  /// Insert member
  Future<int> insertMember(Member member) async {
    return await _ormService.insertMember(member);
  }

  /// Get all members
  Future<List<Member>> getAllMembers() async {
    return await _ormService.getAllMembers();
  }

  /// Get member by ID
  Future<Member?> getMemberById(int id) async {
    return await _ormService.getMemberById(id);
  }

  /// Get member by identification ID
  Future<Member?> getMemberByIdentificationId(String memberId) async {
    return await _ormService.getMemberByIdentificationId(memberId);
  }

  /// Update member
  Future<int> updateMember(Member member) async {
    return await _ormService.updateMember(member);
  }

  /// Delete member
  Future<int> deleteMember(int id) async {
    return await _ormService.deleteMember(id);
  }

  // ========== EVENT OPERATIONS ==========

  /// Insert event
  Future<int> insertEvent(Event event) async {
    return await _ormService.insertEvent(event);
  }

  /// Get all events
  Future<List<Event>> getAllEvents() async {
    return await _ormService.getAllEvents();
  }

  /// Get event by ID
  Future<Event?> getEventById(int id) async {
    return await _ormService.getEventById(id);
  }

  /// Get active events
  Future<List<Event>> getActiveEvents() async {
    return await _ormService.getActiveEvents();
  }

  /// Update event
  Future<int> updateEvent(Event event) async {
    return await _ormService.updateEvent(event);
  }

  /// Delete event
  Future<int> deleteEvent(int id) async {
    return await _ormService.deleteEvent(id);
  }

  // ========== ATTENDANCE OPERATIONS ==========

  /// Insert attendance
  Future<int> insertAttendance(Attendance attendance) async {
    return await _ormService.insertAttendance(attendance);
  }

  /// Get all attendance
  Future<List<Attendance>> getAllAttendance() async {
    return await _ormService.getAllAttendance();
  }

  /// Get attendance by event
  Future<List<Attendance>> getAttendanceByEvent(int eventId) async {
    return await _ormService.getAttendanceByEvent(eventId);
  }

  /// Get attendance by member
  Future<List<Attendance>> getAttendanceByMember(int memberId) async {
    return await _ormService.getAttendanceByMember(memberId);
  }

  /// Get attendance by member and event
  Future<Attendance?> getAttendanceByMemberAndEvent(int memberId, int eventId) async {
    return await _ormService.getAttendanceByMemberAndEvent(memberId, eventId);
  }

  /// Update attendance
  Future<int> updateAttendance(Attendance attendance) async {
    return await _ormService.updateAttendance(attendance);
  }

  /// Delete attendance
  Future<int> deleteAttendance(int id) async {
    return await _ormService.deleteAttendance(id);
  }

  // ========== SETTINGS OPERATIONS ==========

  /// Set setting
  Future<void> setSetting(String key, String value) async {
    // Use SettingsRepository through ORM
    final settingsRepo = _ormService.getRepository<SettingsRepository>();
    await settingsRepo.setValue(key, value);
  }

  /// Get setting
  Future<String?> getSetting(String key) async {
    final settingsRepo = _ormService.getRepository<SettingsRepository>();
    return await settingsRepo.getValue(key);
  }

  /// Get all settings
  Future<Map<String, String>> getAllSettings() async {
    final settingsRepo = _ormService.getRepository<SettingsRepository>();
    final settings = await settingsRepo.findAll();
    final result = <String, String>{};
    for (final setting in settings) {
      result[setting.key] = setting.value;
    }
    return result;
  }

  // ========== BULK OPERATIONS ==========

  /// Bulk insert members
  Future<void> insertMembers(List<Member> members) async {
    await _ormService.insertMembers(members);
  }

  /// Clear all members
  Future<void> clearAllMembers() async {
    await _ormService.clearAllMembers();
  }

  /// Bulk insert events
  Future<void> insertEvents(List<Event> events) async {
    await _ormService.insertEvents(events);
  }

  /// Bulk insert attendance
  Future<void> insertAttendanceList(List<Attendance> attendanceList) async {
    await _ormService.insertAttendanceList(attendanceList);
  }

  // ========== CLEANUP OPERATIONS ==========

  /// Clear all data
  Future<void> clearAllData() async {
    await _ormService.clearAllMembers();
    // Clear all entities through repositories
    final memberRepo = _ormService.getRepository<MemberRepository>();
    final eventRepo = _ormService.getRepository<EventRepository>();
    final attendanceRepo = _ormService.getRepository<AttendanceRepository>();
    final settingsRepo = _ormService.getRepository<SettingsRepository>();
    
    await memberRepo.deleteAll();
    await eventRepo.deleteAll();
    await attendanceRepo.deleteAll();
    await settingsRepo.deleteAll();
  }

  /// Clear old data
  Future<void> clearOldData({int daysOld = 30}) async {
    final cutoffDate = DateTime.now().subtract(Duration(days: daysOld));
    final attendanceRepo = _ormService.getRepository<AttendanceRepository>();
    
    // Delete old attendance records
    final oldAttendance = await attendanceRepo.findWhere(
      'check_in_time < ?',
      [cutoffDate.millisecondsSinceEpoch],
    );
    
    for (final attendance in oldAttendance) {
      if (attendance.id != null) {
        await attendanceRepo.deleteById(attendance.id!);
      }
    }
  }

  /// Close database
  Future<void> close() async {
    await _ormService.close();
  }

  // ========== ADDITIONAL METHODS ==========

  /// Get offline attendance (placeholder)
  Future<List<Attendance>> getOfflineAttendance() async {
    return await getAllAttendance();
  }

  /// Mark attendance as synced
  Future<void> markAttendanceSynced(int attendanceId) async {
    final attendanceRepo = _ormService.getRepository<AttendanceRepository>();
    final attendance = await attendanceRepo.findById(attendanceId);
    if (attendance != null) {
      // Update attendance record to mark as synced
      final updatedAttendance = attendance.copyWith(
        updatedAt: DateTime.now(),
      );
      await attendanceRepo.update(updatedAttendance);
    }
  }

  /// Get database info
  Future<Map<String, dynamic>> getDatabaseInfo() async {
    return await _ormService.getDatabaseInfo();
  }

  /// Reset database
  Future<void> resetDatabase() async {
    await _ormService.resetDatabase();
  }

  /// Force recreate database
  Future<void> forceRecreateDatabase() async {
    await _ormService.resetDatabase();
  }

  /// Backup database
  Future<String> backupDatabase() async {
    return await _ormService.backupDatabase();
  }

  /// Restore database
  Future<void> restoreDatabase(String backupPath) async {
    await _ormService.restoreDatabase(backupPath);
  }

  /// Get current database version
  int get currentVersion => _ormService.currentVersion;

  /// Check if service is initialized
  bool get isInitialized => _ormService.isInitialized;

  /// Get unique groups from members
  Future<List<String>> getUniqueGroups() async {
    final memberRepo = _ormService.getRepository<MemberRepository>();
    return await memberRepo.getUniqueGroups();
  }

  /// Get unique families from members
  Future<List<String>> getUniqueFamilies() async {
    final memberRepo = _ormService.getRepository<MemberRepository>();
    return await memberRepo.getUniqueFamilies();
  }
}

/// Mock database class for compatibility with existing code
class _MockDatabase {
  // This class provides a mock database interface for compatibility
  // The actual database operations are handled by the ORM service
}
