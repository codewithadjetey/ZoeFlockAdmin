import 'package:sqflite/sqflite.dart';
import 'orm_service.dart';

/// Base migration class that all migrations should extend
abstract class Migration {
  /// Migration version number
  int get version;
  
  /// Migration name/description
  String get name;
  
  /// Run the migration
  Future<void> up(Database db);
  
  /// Rollback the migration
  Future<void> down(Database db);
  
  /// Check if migration can be rolled back
  bool get canRollback => true;
}

/// Migration manager for handling database migrations
class MigrationManager {
  static final MigrationManager _instance = MigrationManager._internal();
  factory MigrationManager() => _instance;
  MigrationManager._internal();

  final OrmService _ormService = OrmService();
  final List<Migration> _migrations = [];
  final String _migrationsTable = 'orm_migrations';

  /// Register a migration
  void register(Migration migration) {
    _migrations.add(migration);
    _migrations.sort((a, b) => a.version.compareTo(b.version));
  }

  /// Register multiple migrations
  void registerAll(List<Migration> migrations) {
    for (final migration in migrations) {
      register(migration);
    }
  }

  /// Initialize migration system
  Future<void> initialize() async {
    final db = await _ormService.database;
    await _createMigrationsTable(db);
  }

  /// Create migrations table
  Future<void> _createMigrationsTable(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS $_migrationsTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL,
        executed_at INTEGER NOT NULL,
        execution_time INTEGER,
        success INTEGER NOT NULL DEFAULT 1
      )
    ''');
  }

  /// Run all pending migrations
  Future<void> runMigrations() async {
    final db = await _ormService.database;
    final executedMigrations = await _getExecutedMigrations(db);
    
    for (final migration in _migrations) {
      if (!executedMigrations.contains(migration.version)) {
        await _runMigration(db, migration);
      }
    }
  }

  /// Run a specific migration
  Future<void> _runMigration(Database db, Migration migration) async {
    final startTime = DateTime.now();
    
    try {
      print('Running migration ${migration.version}: ${migration.name}');
      
      await db.transaction((txn) async {
        await migration.up(txn);
        await _recordMigration(txn, migration, startTime, true);
      });
      
      final executionTime = DateTime.now().difference(startTime).inMilliseconds;
      print('Migration ${migration.version} completed in ${executionTime}ms');
    } catch (e) {
      print('Migration ${migration.version} failed: $e');
      await _recordMigration(db, migration, startTime, false);
      rethrow;
    }
  }

  /// Record migration execution
  Future<void> _recordMigration(
    Database db, 
    Migration migration, 
    DateTime startTime, 
    bool success
  ) async {
    final executionTime = DateTime.now().difference(startTime).inMilliseconds;
    
    await db.insert(
      _migrationsTable,
      {
        'version': migration.version,
        'name': migration.name,
        'executed_at': DateTime.now().millisecondsSinceEpoch,
        'execution_time': executionTime,
        'success': success ? 1 : 0,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Get executed migrations
  Future<List<int>> _getExecutedMigrations(Database db) async {
    final result = await db.query(
      _migrationsTable,
      columns: ['version'],
      where: 'success = ?',
      whereArgs: [1],
    );
    
    return result.map((row) => row['version'] as int).toList();
  }

  /// Rollback last migration
  Future<void> rollbackLast() async {
    final db = await _ormService.database;
    final lastMigration = await _getLastExecutedMigration(db);
    
    if (lastMigration == null) {
      throw Exception('No migrations to rollback');
    }
    
    await rollbackTo(lastMigration.version - 1);
  }

  /// Rollback to specific version
  Future<void> rollbackTo(int targetVersion) async {
    final db = await _ormService.database;
    final executedMigrations = await _getExecutedMigrations(db);
    
    // Get migrations to rollback (in reverse order)
    final migrationsToRollback = _migrations
        .where((m) => executedMigrations.contains(m.version) && m.version > targetVersion)
        .toList()
      ..sort((a, b) => b.version.compareTo(a.version));
    
    for (final migration in migrationsToRollback) {
      if (!migration.canRollback) {
        throw Exception('Migration ${migration.version} cannot be rolled back');
      }
      
      await _rollbackMigration(db, migration);
    }
  }

  /// Rollback a specific migration
  Future<void> _rollbackMigration(Database db, Migration migration) async {
    final startTime = DateTime.now();
    
    try {
      print('Rolling back migration ${migration.version}: ${migration.name}');
      
      await db.transaction((txn) async {
        await migration.down(txn);
        await _removeMigrationRecord(txn, migration.version);
      });
      
      final executionTime = DateTime.now().difference(startTime).inMilliseconds;
      print('Migration ${migration.version} rolled back in ${executionTime}ms');
    } catch (e) {
      print('Failed to rollback migration ${migration.version}: $e');
      rethrow;
    }
  }

  /// Remove migration record
  Future<void> _removeMigrationRecord(Database db, int version) async {
    await db.delete(
      _migrationsTable,
      where: 'version = ?',
      whereArgs: [version],
    );
  }

  /// Get migration status
  Future<Map<String, dynamic>> getStatus() async {
    final db = await _ormService.database;
    final executedMigrations = await _getExecutedMigrations(db);
    
    return {
      'total_migrations': _migrations.length,
      'executed_migrations': executedMigrations.length,
      'pending_migrations': _migrations.length - executedMigrations.length,
      'last_migration': executedMigrations.isNotEmpty ? executedMigrations.last : null,
    };
  }

  /// Get migration history
  Future<List<Map<String, dynamic>>> getHistory() async {
    final db = await _ormService.database;
    return await db.query(
      _migrationsTable,
      orderBy: 'version DESC',
    );
  }

  /// Reset all migrations (dangerous - use with caution)
  Future<void> reset() async {
    final db = await _ormService.database;
    await db.delete(_migrationsTable);
    print('All migration records cleared');
  }
}

/// Migration for creating users table
class CreateUsersTableMigration extends Migration {
  @override
  int get version => 1;

  @override
  String get name => 'Create users table';

  @override
  Future<void> up(Database db) async {
    await db.execute('''
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        profile_image_path TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        is_active INTEGER NOT NULL DEFAULT 1,
        last_login_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    ''');

    await db.execute('''
      CREATE INDEX idx_users_username ON users (username)
    ''');

    await db.execute('''
      CREATE INDEX idx_users_email ON users (email)
    ''');
  }

  @override
  Future<void> down(Database db) async {
    await db.execute('DROP TABLE IF EXISTS users');
  }
}

/// Migration for creating groups table
class CreateGroupsTableMigration extends Migration {
  @override
  int get version => 2;

  @override
  String get name => 'Create groups table';

  @override
  Future<void> up(Database db) async {
    await db.execute('''
      CREATE TABLE groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT,
        icon TEXT,
        leader_id INTEGER,
        leader_name TEXT,
        member_count INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (leader_id) REFERENCES users (id)
      )
    ''');

    await db.execute('''
      CREATE INDEX idx_groups_name ON groups (name)
    ''');
  }

  @override
  Future<void> down(Database db) async {
    await db.execute('DROP TABLE IF EXISTS groups');
  }
}

/// Migration for creating families table
class CreateFamiliesTableMigration extends Migration {
  @override
  int get version => 3;

  @override
  String get name => 'Create families table';

  @override
  Future<void> up(Database db) async {
    await db.execute('''
      CREATE TABLE families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        head_of_family_id INTEGER,
        head_of_family_name TEXT,
        member_count INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (head_of_family_id) REFERENCES users (id)
      )
    ''');

    await db.execute('''
      CREATE INDEX idx_families_name ON families (name)
    ''');
  }

  @override
  Future<void> down(Database db) async {
    await db.execute('DROP TABLE IF EXISTS families');
  }
}

/// Migration for adding foreign keys to members table
class AddForeignKeysToMembersMigration extends Migration {
  @override
  int get version => 4;

  @override
  String get name => 'Add foreign keys to members table';

  @override
  Future<void> up(Database db) async {
    // Add group_id column if it doesn't exist
    try {
      await db.execute('ALTER TABLE members ADD COLUMN group_id INTEGER');
    } catch (e) {
      // Column might already exist
    }

    // Add family_id column if it doesn't exist
    try {
      await db.execute('ALTER TABLE members ADD COLUMN family_id INTEGER');
    } catch (e) {
      // Column might already exist
    }

    // Create foreign key constraints (SQLite doesn't support ALTER TABLE ADD CONSTRAINT)
    // We'll need to recreate the table with foreign keys
    await db.execute('''
      CREATE TABLE members_new (
        id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        profile_image_path TEXT,
        member_identification_id TEXT NOT NULL UNIQUE,
        group_name TEXT,
        family TEXT,
        group_id INTEGER,
        family_id INTEGER,
        gender TEXT,
        phone TEXT,
        date_of_birth INTEGER,
        status TEXT NOT NULL,
        last_attendance_date INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (group_id) REFERENCES groups (id),
        FOREIGN KEY (family_id) REFERENCES families (id)
      )
    ''');

    // Copy data from old table
    await db.execute('''
      INSERT INTO members_new 
      SELECT *, NULL, NULL FROM members
    ''');

    // Drop old table and rename new one
    await db.execute('DROP TABLE members');
    await db.execute('ALTER TABLE members_new RENAME TO members');

    // Recreate indexes
    await db.execute('''
      CREATE INDEX idx_members_identification_id 
      ON members (member_identification_id)
    ''');
  }

  @override
  Future<void> down(Database db) async {
    // Remove foreign key columns
    await db.execute('''
      CREATE TABLE members_old (
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

    await db.execute('''
      INSERT INTO members_old 
      SELECT id, first_name, last_name, email, profile_image_path, 
             member_identification_id, group_name, family, gender, phone,
             date_of_birth, status, last_attendance_date, created_at, updated_at
      FROM members
    ''');

    await db.execute('DROP TABLE members');
    await db.execute('ALTER TABLE members_old RENAME TO members');

    await db.execute('''
      CREATE INDEX idx_members_identification_id 
      ON members (member_identification_id)
    ''');
  }
}

/// Migration for creating ORM migrations table
class CreateOrmMigrationsTableMigration extends Migration {
  @override
  int get version => 5;

  @override
  String get name => 'Create ORM migrations table';

  @override
  Future<void> up(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS orm_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL,
        executed_at INTEGER NOT NULL,
        execution_time INTEGER,
        success INTEGER NOT NULL DEFAULT 1
      )
    ''');
  }

  @override
  Future<void> down(Database db) async {
    await db.execute('DROP TABLE IF EXISTS orm_migrations');
  }
}

/// Migration registry
class MigrationRegistry {
  static final MigrationManager _migrationManager = MigrationManager();

  /// Register all migrations
  static void registerAll() {
    _migrationManager.registerAll([
      CreateUsersTableMigration(),
      CreateGroupsTableMigration(),
      CreateFamiliesTableMigration(),
      AddForeignKeysToMembersMigration(),
      CreateOrmMigrationsTableMigration(),
    ]);
  }

  /// Get migration manager
  static MigrationManager get manager => _migrationManager;
}
