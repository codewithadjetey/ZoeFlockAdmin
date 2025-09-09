import 'dart:async';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/member.dart';
import '../models/event.dart';
import '../models/attendance.dart';
import '../utils/constants.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final databasesPath = await getDatabasesPath();
    final path = join(databasesPath, DatabaseConstants.databaseName);

    return await openDatabase(
      path,
      version: DatabaseConstants.databaseVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Create members table
    await db.execute('''
      CREATE TABLE ${DatabaseConstants.membersTable} (
        id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        profile_image_path TEXT,
        member_identification_id TEXT NOT NULL UNIQUE,
        group_name TEXT,
        family TEXT,
        gender TEXT,
        phone TEXT,
        date_of_birth INTEGER,
        status TEXT NOT NULL,
        last_attendance_date INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    ''');

    // Create events table
    await db.execute('''
      CREATE TABLE ${DatabaseConstants.eventsTable} (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        start_date INTEGER NOT NULL,
        end_date INTEGER,
        location TEXT,
        time TEXT,
        status TEXT NOT NULL,
        attendance_count INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    ''');

    // Create attendance table
    await db.execute('''
      CREATE TABLE ${DatabaseConstants.attendanceTable} (
        id INTEGER PRIMARY KEY,
        member_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        check_in_time INTEGER NOT NULL,
        notes TEXT,
        is_first_timer INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (member_id) REFERENCES ${DatabaseConstants.membersTable} (id),
        FOREIGN KEY (event_id) REFERENCES ${DatabaseConstants.eventsTable} (id)
      )
    ''');

    // Create settings table
    await db.execute('''
      CREATE TABLE ${DatabaseConstants.settingsTable} (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    ''');

    // Create indexes for better performance
    await db.execute('''
      CREATE INDEX idx_members_identification_id 
      ON ${DatabaseConstants.membersTable} (member_identification_id)
    ''');

    await db.execute('''
      CREATE INDEX idx_attendance_member_event 
      ON ${DatabaseConstants.attendanceTable} (member_id, event_id)
    ''');

    await db.execute('''
      CREATE INDEX idx_events_start_date 
      ON ${DatabaseConstants.eventsTable} (start_date)
    ''');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Handle database upgrades here
    if (oldVersion < 2) {
      // Add new columns or tables for version 2
    }
  }

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
    final db = _database;
    if (db != null) {
      await db.close();
      _database = null;
    }
  }
}
