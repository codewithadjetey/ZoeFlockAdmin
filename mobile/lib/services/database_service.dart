import 'dart:async';
import 'dart:io';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/member.dart';
import '../models/event.dart';
import '../models/attendance.dart';
import '../utils/constants.dart';
import 'database_helper.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  final DatabaseHelper _dbHelper = DatabaseHelper();
  Database? _database;
  bool _isInitialized = false;

  /// Initialize the database service
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      print('DatabaseService: Initializing database...');
      
      // Initialize the database helper
      await _dbHelper.initialize();
      _database = await _dbHelper.database;
      _isInitialized = true;
      print('DatabaseService: Database initialized successfully');
    } catch (e) {
      print('DatabaseService: Error initializing database: $e');
      // For now, we'll continue without database functionality
      // In a production app, you might want to show an error to the user
      _isInitialized = true; // Set to true to prevent infinite retry
    }
  }

  Future<Database> get database async {
    if (!_isInitialized) {
      await initialize();
    }
    
    if (_database != null) return _database!;
    _database = await _dbHelper.database;
    return _database!;
  }

  // Database initialization is now handled by DatabaseHelper

  // Member operations
  Future<int> insertMember(Member member) async {
    final db = await database;
    return await db.insert(
      DatabaseConstants.membersTable,
      member.toDatabaseJson(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Member>> getAllMembers() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      DatabaseConstants.membersTable,
      orderBy: 'first_name ASC, last_name ASC',
    );
    return maps.map((map) => Member.fromDatabase(map)).toList();
  }

  Future<Member?> getMemberById(int id) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      DatabaseConstants.membersTable,
      where: 'id = ?',
      whereArgs: [id],
    );
    if (maps.isNotEmpty) {
      return Member.fromDatabase(maps.first);
    }
    return null;
  }

  Future<Member?> getMemberByIdentificationId(String memberId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      DatabaseConstants.membersTable,
      where: 'member_identification_id = ?',
      whereArgs: [memberId],
    );
    if (maps.isNotEmpty) {
      return Member.fromDatabase(maps.first);
    }
    return null;
  }

  Future<int> updateMember(Member member) async {
    final db = await database;
    return await db.update(
      DatabaseConstants.membersTable,
      member.toDatabaseJson(),
      where: 'id = ?',
      whereArgs: [member.id],
    );
  }

  Future<int> deleteMember(int id) async {
    final db = await database;
    return await db.delete(
      DatabaseConstants.membersTable,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Event operations
  Future<int> insertEvent(Event event) async {
    final db = await database;
    return await db.insert(
      DatabaseConstants.eventsTable,
      event.toDatabaseJson(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Event>> getAllEvents() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      DatabaseConstants.eventsTable,
      orderBy: 'start_date DESC',
    );
    return maps.map((map) => Event.fromDatabase(map)).toList();
  }

  Future<Event?> getEventById(int id) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      DatabaseConstants.eventsTable,
      where: 'id = ?',
      whereArgs: [id],
    );
    if (maps.isNotEmpty) {
      return Event.fromDatabase(maps.first);
    }
    return null;
  }

  Future<List<Event>> getActiveEvents() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      DatabaseConstants.eventsTable,
      where: 'status = ?',
      whereArgs: ['active'],
      orderBy: 'start_date DESC',
    );
    return maps.map((map) => Event.fromDatabase(map)).toList();
  }

  Future<int> updateEvent(Event event) async {
    final db = await database;
    return await db.update(
      DatabaseConstants.eventsTable,
      event.toDatabaseJson(),
      where: 'id = ?',
      whereArgs: [event.id],
    );
  }

  Future<int> deleteEvent(int id) async {
    final db = await database;
    return await db.delete(
      DatabaseConstants.eventsTable,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Attendance operations
  Future<int> insertAttendance(Attendance attendance) async {
    final db = await database;
    return await db.insert(
      DatabaseConstants.attendanceTable,
      attendance.toDatabaseJson(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Attendance>> getAllAttendance() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      DatabaseConstants.attendanceTable,
      orderBy: 'check_in_time DESC',
    );
    return maps.map((map) => Attendance.fromDatabase(map)).toList();
  }

  Future<List<Attendance>> getAttendanceByEvent(int eventId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      DatabaseConstants.attendanceTable,
      where: 'event_id = ?',
      whereArgs: [eventId],
      orderBy: 'check_in_time DESC',
    );
    return maps.map((map) => Attendance.fromDatabase(map)).toList();
  }

  Future<List<Attendance>> getAttendanceByMember(int memberId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      DatabaseConstants.attendanceTable,
      where: 'member_id = ?',
      whereArgs: [memberId],
      orderBy: 'check_in_time DESC',
    );
    return maps.map((map) => Attendance.fromDatabase(map)).toList();
  }

  Future<Attendance?> getAttendanceByMemberAndEvent(int memberId, int eventId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      DatabaseConstants.attendanceTable,
      where: 'member_id = ? AND event_id = ?',
      whereArgs: [memberId, eventId],
    );
    if (maps.isNotEmpty) {
      return Attendance.fromDatabase(maps.first);
    }
    return null;
  }

  Future<int> updateAttendance(Attendance attendance) async {
    final db = await database;
    return await db.update(
      DatabaseConstants.attendanceTable,
      attendance.toDatabaseJson(),
      where: 'id = ?',
      whereArgs: [attendance.id],
    );
  }

  Future<int> deleteAttendance(int id) async {
    final db = await database;
    return await db.delete(
      DatabaseConstants.attendanceTable,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Settings operations
  Future<void> setSetting(String key, String value) async {
    final db = await database;
    await db.insert(
      DatabaseConstants.settingsTable,
      {
        'key': key,
        'value': value,
        'updated_at': DateTime.now().millisecondsSinceEpoch,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<String?> getSetting(String key) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      DatabaseConstants.settingsTable,
      where: 'key = ?',
      whereArgs: [key],
    );
    if (maps.isNotEmpty) {
      return maps.first['value'] as String;
    }
    return null;
  }

  Future<Map<String, String>> getAllSettings() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      DatabaseConstants.settingsTable,
    );
    return Map.fromEntries(
      maps.map((map) => MapEntry(
        map['key'] as String,
        map['value'] as String,
      )),
    );
  }

  // Bulk operations
  Future<void> insertMembers(List<Member> members) async {
    final db = await database;
    final batch = db.batch();
    
    for (final member in members) {
      batch.insert(
        DatabaseConstants.membersTable,
        member.toDatabaseJson(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    
    await batch.commit();
  }

  Future<void> insertEvents(List<Event> events) async {
    final db = await database;
    final batch = db.batch();
    
    for (final event in events) {
      batch.insert(
        DatabaseConstants.eventsTable,
        event.toDatabaseJson(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    
    await batch.commit();
  }

  Future<void> insertAttendanceList(List<Attendance> attendanceList) async {
    final db = await database;
    final batch = db.batch();
    
    for (final attendance in attendanceList) {
      batch.insert(
        DatabaseConstants.attendanceTable,
        attendance.toDatabaseJson(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    
    await batch.commit();
  }

  // Cleanup operations
  Future<void> clearAllData() async {
    final db = await database;
    await db.delete(DatabaseConstants.attendanceTable);
    await db.delete(DatabaseConstants.membersTable);
    await db.delete(DatabaseConstants.eventsTable);
    await db.delete(DatabaseConstants.settingsTable);
  }

  Future<void> clearOldData({int daysOld = 30}) async {
    final db = await database;
    final cutoffDate = DateTime.now().subtract(Duration(days: daysOld));
    
    await db.delete(
      DatabaseConstants.attendanceTable,
      where: 'created_at < ?',
      whereArgs: [cutoffDate.millisecondsSinceEpoch],
    );
  }

  Future<void> close() async {
    await _dbHelper.close();
    _database = null;
    _isInitialized = false;
  }

  // Additional methods needed by the app
  Future<List<Attendance>> getOfflineAttendance() async {
    // For now, return all attendance records
    // In a real implementation, you might want to filter by sync status
    return await getAllAttendance();
  }

  Future<void> markAttendanceSynced(int attendanceId) async {
    // This would update a sync status field in the attendance table
    // For now, we'll just log it
    print('Marking attendance $attendanceId as synced');
  }

  // Database helper methods
  Future<Map<String, dynamic>> getDatabaseInfo() async {
    return await _dbHelper.getDatabaseInfo();
  }

  Future<void> resetDatabase() async {
    await _dbHelper.resetDatabase();
    _database = await _dbHelper.database;
  }

  Future<void> forceRecreateDatabase() async {
    await _dbHelper.forceRecreateDatabase();
    _database = await _dbHelper.database;
  }

  Future<String> backupDatabase() async {
    return await _dbHelper.backupDatabase();
  }

  Future<void> restoreDatabase(String backupPath) async {
    await _dbHelper.restoreDatabase(backupPath);
    _database = await _dbHelper.database;
  }

  int get currentVersion => _dbHelper.currentVersion;
}

