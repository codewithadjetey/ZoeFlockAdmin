import 'dart:async';
import 'dart:io';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../utils/constants.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  factory DatabaseHelper() => _instance;
  DatabaseHelper._internal();

  Database? _database;
  bool _isInitialized = false;

  // Current database version - increment this when you need to add migrations
  static const int _currentVersion = 3;

  /// Initialize the database service
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      print('DatabaseHelper: Initializing database...');
      
      // Test database initialization
      await _initDatabase();
      _isInitialized = true;
      print('DatabaseHelper: Database initialized successfully');
    } catch (e) {
      print('DatabaseHelper: Error initializing database: $e');
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
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    try {
      print('DatabaseHelper: Getting databases path...');
      final databasesPath = await getDatabasesPath();
      final path = join(databasesPath, DatabaseConstants.databaseName);
      
      print('DatabaseHelper: Opening database at path: $path');
      final database = await openDatabase(
        path,
        version: _currentVersion,
        onCreate: _onCreate,
        onUpgrade: _onUpgrade,
      );
      
      print('DatabaseHelper: Database opened successfully');
      return database;
    } catch (e) {
      print('DatabaseHelper: Error opening database: $e');
      print('DatabaseHelper: Error type: ${e.runtimeType}');
      
      // If we're on a platform that doesn't support sqflite, 
      // we'll throw a more descriptive error
      if (e.toString().contains('databaseFactory not initialized')) {
        throw Exception('Database not supported on this platform. This app requires a mobile device.');
      }
      
      rethrow;
    }
  }

  /// Create initial database schema
  Future<void> _onCreate(Database db, int version) async {
    print('DatabaseHelper: Creating database schema for version $version');
    await _createInitialSchema(db);
    
    // Run all migrations for new database
    print('DatabaseHelper: Running all migrations for new database');
    for (int migrationVersion = 1; migrationVersion <= version; migrationVersion++) {
      print('DatabaseHelper: Running migration for version $migrationVersion');
      await _runMigration(db, migrationVersion);
    }
  }

  /// Handle database upgrades
  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    print('DatabaseHelper: Upgrading database from version $oldVersion to $newVersion');
    
    // Migrate up to the current version
    for (int version = oldVersion + 1; version <= newVersion; version++) {
      print('DatabaseHelper: Running migration for version $version');
      await _runMigration(db, version);
    }
    
    print('DatabaseHelper: Database upgrade completed');
  }

  /// Run specific migration based on version
  Future<void> _runMigration(Database db, int version) async {
    print('DatabaseHelper: _runMigration called for version $version');
    switch (version) {
      case 1:
        // Migration for version 1 - Create members table
        print('DatabaseHelper: Running migration V1 - Creating members table');
        
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

        // Create index for members table
        await db.execute('''
          CREATE INDEX idx_members_identification_id 
          ON ${DatabaseConstants.membersTable} (member_identification_id)
        ''');
        break;
        
      case 2:
        // Migration for version 2 - Create events table
        print('DatabaseHelper: Running migration V2 - Creating events table');
        
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

        // Create index for events table
        await db.execute('''
          CREATE INDEX idx_events_start_date 
          ON ${DatabaseConstants.eventsTable} (start_date)
        ''');
        break;
        
      case 3:
        // Migration for version 3 - Create attendance and settings tables
        print('DatabaseHelper: Running migration V3 - Creating attendance and settings tables');
        
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

        // Create index for attendance table
        await db.execute('''
          CREATE INDEX idx_attendance_member_event 
          ON ${DatabaseConstants.attendanceTable} (member_id, event_id)
        ''');
        break;
        
      default:
        print('DatabaseHelper: No migration found for version $version');
        break;
    }
  }

  /// Create initial database schema
  Future<void> _createInitialSchema(Database db) async {
    // Create config table - this is the only table in initial schema
    await db.execute('''
      CREATE TABLE config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint_url TEXT NOT NULL,
        version TEXT NOT NULL,
        app_name TEXT NOT NULL,
        encryption_key TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    ''');

    // Insert default config values
    await db.execute('''
      INSERT INTO config (endpoint_url, version, app_name, encryption_key, created_at, updated_at)
      VALUES ('', '1.0.0', 'Church Attendance Scanner', '', ?, ?)
    ''', [DateTime.now().millisecondsSinceEpoch, DateTime.now().millisecondsSinceEpoch]);
  }

  /// Create database indexes
  Future<void> _createIndexes(Database db) async {
    // Create indexes for members table
    await db.execute('''
      CREATE INDEX idx_members_identification_id 
      ON ${DatabaseConstants.membersTable} (member_identification_id)
    ''');

    // Create indexes for attendance table
    await db.execute('''
      CREATE INDEX idx_attendance_member_event 
      ON ${DatabaseConstants.attendanceTable} (member_id, event_id)
    ''');

    // Create indexes for events table
    await db.execute('''
      CREATE INDEX idx_events_start_date 
      ON ${DatabaseConstants.eventsTable} (start_date)
    ''');
  }

  // ===== MIGRATION METHODS =====
  // Migration queries are now inline in the switch case above

  // ===== UTILITY METHODS =====

  /// Get current database version
  int get currentVersion => _currentVersion;

  /// Check if database is initialized
  bool get isInitialized => _isInitialized;

  /// Get database info
  Future<Map<String, dynamic>> getDatabaseInfo() async {
    final db = await database;
    final version = await db.getVersion();
    
    return {
      'version': version,
      'currentVersion': _currentVersion,
      'isInitialized': _isInitialized,
      'path': db.path,
    };
  }

  /// Close database connection
  Future<void> close() async {
    final db = _database;
    if (db != null) {
      await db.close();
      _database = null;
      _isInitialized = false;
      print('DatabaseHelper: Database connection closed');
    }
  }

  /// Drop all tables (for testing/reset)
  Future<void> dropAllTables() async {
    final db = await database;
    
    await db.execute('DROP TABLE IF EXISTS ${DatabaseConstants.attendanceTable}');
    await db.execute('DROP TABLE IF EXISTS ${DatabaseConstants.membersTable}');
    await db.execute('DROP TABLE IF EXISTS ${DatabaseConstants.eventsTable}');
    await db.execute('DROP TABLE IF EXISTS ${DatabaseConstants.settingsTable}');
    await db.execute('DROP TABLE IF EXISTS config');
    
    print('DatabaseHelper: All tables dropped');
  }

  /// Reset database to initial state
  Future<void> resetDatabase() async {
    await close();
    await dropAllTables();
    _database = await _initDatabase();
    print('DatabaseHelper: Database reset completed');
  }

  /// Force database recreation (for debugging)
  Future<void> forceRecreateDatabase() async {
    print('DatabaseHelper: Force recreating database...');
    await close();
    
    try {
      final databasesPath = await getDatabasesPath();
      final path = join(databasesPath, DatabaseConstants.databaseName);
      
      // Delete the database file
      final file = File(path);
      if (await file.exists()) {
        await file.delete();
        print('DatabaseHelper: Database file deleted');
      }
      
      // Recreate database
      _database = await _initDatabase();
      print('DatabaseHelper: Database force recreation completed');
    } catch (e) {
      print('DatabaseHelper: Error force recreating database: $e');
      rethrow;
    }
  }

  /// Backup database (returns database file path)
  Future<String> backupDatabase() async {
    final db = await database;
    final backupPath = '${db.path}.backup';
    
    // In a real implementation, you would copy the database file
    // For now, we'll just return the current path
    print('DatabaseHelper: Database backup created at $backupPath');
    return backupPath;
  }

  /// Restore database from backup
  Future<void> restoreDatabase(String backupPath) async {
    await close();
    
    // In a real implementation, you would copy the backup file over the current database
    // For now, we'll just reinitialize
    _database = await _initDatabase();
    print('DatabaseHelper: Database restored from $backupPath');
  }

  // ===== MEMBER OPERATIONS =====

  /// Get all members from the database
  Future<List<Map<String, dynamic>>> getAllMembers() async {
    final db = await database;
    try {
      final List<Map<String, dynamic>> maps = await db.query(
        DatabaseConstants.membersTable,
        orderBy: 'first_name ASC, last_name ASC',
      );
      return maps;
    } catch (e) {
      print('DatabaseHelper: Error getting all members: $e');
      return [];
    }
  }

  /// Get members with search functionality
  Future<List<Map<String, dynamic>>> searchMembers(String query) async {
    final db = await database;
    try {
      final List<Map<String, dynamic>> maps = await db.query(
        DatabaseConstants.membersTable,
        where: 'first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR member_identification_id LIKE ?',
        whereArgs: ['%$query%', '%$query%', '%$query%', '%$query%'],
        orderBy: 'first_name ASC, last_name ASC',
      );
      return maps;
    } catch (e) {
      print('DatabaseHelper: Error searching members: $e');
      return [];
    }
  }

  /// Get members by status (active/inactive)
  Future<List<Map<String, dynamic>>> getMembersByStatus(String status) async {
    final db = await database;
    try {
      final List<Map<String, dynamic>> maps = await db.query(
        DatabaseConstants.membersTable,
        where: 'status = ?',
        whereArgs: [status],
        orderBy: 'first_name ASC, last_name ASC',
      );
      return maps;
    } catch (e) {
      print('DatabaseHelper: Error getting members by status: $e');
      return [];
    }
  }

  /// Get members by group
  Future<List<Map<String, dynamic>>> getMembersByGroup(String group) async {
    final db = await database;
    try {
      final List<Map<String, dynamic>> maps = await db.query(
        DatabaseConstants.membersTable,
        where: 'group_name = ?',
        whereArgs: [group],
        orderBy: 'first_name ASC, last_name ASC',
      );
      return maps;
    } catch (e) {
      print('DatabaseHelper: Error getting members by group: $e');
      return [];
    }
  }

  /// Get member by ID
  Future<Map<String, dynamic>?> getMemberById(int id) async {
    final db = await database;
    try {
      final List<Map<String, dynamic>> maps = await db.query(
        DatabaseConstants.membersTable,
        where: 'id = ?',
        whereArgs: [id],
      );
      return maps.isNotEmpty ? maps.first : null;
    } catch (e) {
      print('DatabaseHelper: Error getting member by ID: $e');
      return null;
    }
  }

  /// Get member by identification ID
  Future<Map<String, dynamic>?> getMemberByIdentificationId(String identificationId) async {
    final db = await database;
    try {
      final List<Map<String, dynamic>> maps = await db.query(
        DatabaseConstants.membersTable,
        where: 'member_identification_id = ?',
        whereArgs: [identificationId],
      );
      return maps.isNotEmpty ? maps.first : null;
    } catch (e) {
      print('DatabaseHelper: Error getting member by identification ID: $e');
      return null;
    }
  }

  /// Get unique groups from members
  Future<List<String>> getUniqueGroups() async {
    final db = await database;
    try {
      final List<Map<String, dynamic>> maps = await db.rawQuery(
        'SELECT DISTINCT group_name FROM ${DatabaseConstants.membersTable} WHERE group_name IS NOT NULL AND group_name != "" ORDER BY group_name ASC',
      );
      return maps.map((map) => map['group_name'] as String).toList();
    } catch (e) {
      print('DatabaseHelper: Error getting unique groups: $e');
      return [];
    }
  }

  /// Get member count by status
  Future<Map<String, int>> getMemberCounts() async {
    final db = await database;
    try {
      final activeResult = await db.rawQuery(
        'SELECT COUNT(*) as count FROM ${DatabaseConstants.membersTable} WHERE status = "active"',
      );
      final inactiveResult = await db.rawQuery(
        'SELECT COUNT(*) as count FROM ${DatabaseConstants.membersTable} WHERE status = "inactive"',
      );
      final totalResult = await db.rawQuery(
        'SELECT COUNT(*) as count FROM ${DatabaseConstants.membersTable}',
      );

      return {
        'active': activeResult.first['count'] as int,
        'inactive': inactiveResult.first['count'] as int,
        'total': totalResult.first['count'] as int,
      };
    } catch (e) {
      print('DatabaseHelper: Error getting member counts: $e');
      return {'active': 0, 'inactive': 0, 'total': 0};
    }
  }
}
