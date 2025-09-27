import 'package:sqflite/sqflite.dart';
import '../services/database_helper.dart';
import 'base_entity.dart';
import 'repository.dart';

/// ORM Service that manages database connections and provides repositories
class OrmService {
  static final OrmService _instance = OrmService._internal();
  factory OrmService() => _instance;
  OrmService._internal();

  final DatabaseHelper _dbHelper = DatabaseHelper();
  Database? _database;
  bool _isInitialized = false;
  
  /// Repository cache
  final Map<Type, Repository> _repositories = {};

  /// Initialize the ORM service
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      print('OrmService: Initializing ORM service...');
      
      // Initialize the database helper
      await _dbHelper.initialize();
      _database = await _dbHelper.database;
      _isInitialized = true;
      
      print('OrmService: ORM service initialized successfully');
    } catch (e) {
      print('OrmService: Error initializing ORM service: $e');
      // For now, we'll continue without database functionality
      _isInitialized = true; // Set to true to prevent infinite retry
    }
  }

  /// Get database instance
  Future<Database> get database async {
    if (!_isInitialized) {
      await initialize();
    }
    
    if (_database != null) return _database!;
    _database = await _dbHelper.database;
    return _database!;
  }

  /// Get repository for entity type
  T getRepository<T extends Repository>() {
    if (_repositories.containsKey(T)) {
      return _repositories[T] as T;
    }
    
    throw Exception('Repository for type $T not found. Make sure to register it.');
  }

  /// Register repository
  void registerRepository<T extends Repository>(T repository) {
    _repositories[T] = repository;
  }

  /// Check if ORM is initialized
  bool get isInitialized => _isInitialized;

  /// Close database connection
  Future<void> close() async {
    await _dbHelper.close();
    _database = null;
    _isInitialized = false;
    _repositories.clear();
  }

  /// Reset database
  Future<void> resetDatabase() async {
    await _dbHelper.resetDatabase();
    _database = await _dbHelper.database;
  }

  /// Force recreate database
  Future<void> forceRecreateDatabase() async {
    await _dbHelper.forceRecreateDatabase();
    _database = await _dbHelper.database;
  }

  /// Get database info
  Future<Map<String, dynamic>> getDatabaseInfo() async {
    return await _dbHelper.getDatabaseInfo();
  }

  /// Backup database
  Future<String> backupDatabase() async {
    return await _dbHelper.backupDatabase();
  }

  /// Restore database
  Future<void> restoreDatabase(String backupPath) async {
    await _dbHelper.restoreDatabase(backupPath);
    _database = await _dbHelper.database;
  }

  /// Get current database version
  int get currentVersion => _dbHelper.currentVersion;
}

/// Base repository implementation that provides database access
abstract class BaseRepository<T extends BaseEntity> extends Repository<T> {
  final OrmService _ormService = OrmService();

  @override
  Future<Database> get database => _ormService.database;
}

/// Transaction manager for handling database transactions
class TransactionManager {
  final OrmService _ormService = OrmService();

  /// Execute function within a transaction
  Future<T> transaction<T>(Future<T> Function(Transaction txn) action) async {
    final db = await _ormService.database;
    return await db.transaction(action);
  }

  /// Execute function within a batch
  Future<void> batch(Future<void> Function(Batch batch) action) async {
    final db = await _ormService.database;
    final batch = db.batch();
    await action(batch);
    await batch.commit();
  }
}

/// Database migration manager
class MigrationManager {
  final OrmService _ormService = OrmService();

  /// Run migration
  Future<void> runMigration(String sql, [List<dynamic>? arguments]) async {
    final db = await _ormService.database;
    await db.execute(sql, arguments);
  }

  /// Run multiple migrations
  Future<void> runMigrations(List<String> sqls) async {
    final db = await _ormService.database;
    final batch = db.batch();
    
    for (final sql in sqls) {
      batch.execute(sql);
    }
    
    await batch.commit();
  }
}

/// Database utility functions
class DatabaseUtils {
  final OrmService _ormService = OrmService();

  /// Check if table exists
  Future<bool> tableExists(String tableName) async {
    final db = await _ormService.database;
    final result = await db.rawQuery(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName],
    );
    return result.isNotEmpty;
  }

  /// Get table info
  Future<List<Map<String, dynamic>>> getTableInfo(String tableName) async {
    final db = await _ormService.database;
    return await db.rawQuery('PRAGMA table_info($tableName)');
  }

  /// Get all table names
  Future<List<String>> getAllTableNames() async {
    final db = await _ormService.database;
    final result = await db.rawQuery(
      "SELECT name FROM sqlite_master WHERE type='table'",
    );
    return result.map((row) => row['name'] as String).toList();
  }

  /// Get database size
  Future<int> getDatabaseSize() async {
    final db = await _ormService.database;
    final result = await db.rawQuery('PRAGMA page_count');
    final pageCount = Sqflite.firstIntValue(result) ?? 0;
    
    final pageSizeResult = await db.rawQuery('PRAGMA page_size');
    final pageSize = Sqflite.firstIntValue(pageSizeResult) ?? 0;
    
    return pageCount * pageSize;
  }

  /// Vacuum database
  Future<void> vacuum() async {
    final db = await _ormService.database;
    await db.execute('VACUUM');
  }

  /// Analyze database
  Future<void> analyze() async {
    final db = await _ormService.database;
    await db.execute('ANALYZE');
  }
}
