import 'package:sqflite/sqflite.dart';
import '../utils/constants.dart';
import 'orm_service.dart';

/// Base entity class that provides common database operations
/// All database models should extend this class
abstract class BaseEntity {
  /// Primary key field name
  static const String idField = 'id';
  
  /// Table name - must be implemented by subclasses
  String get tableName;
  
  /// Primary key value
  int? get id;
  
  /// Convert entity to database JSON format
  Map<String, dynamic> toDatabaseJson();
  
  /// Create entity from database JSON
  /// Must be implemented by subclasses
  static BaseEntity fromDatabase(Map<String, dynamic> json) {
    throw UnimplementedError('fromDatabase must be implemented by subclasses');
  }
  
  /// Get database instance
  Future<Database> get _database async {
    // Get database from ORM service
    final ormService = OrmService();
    return await ormService.database;
  }
  
  /// Insert entity into database
  Future<int> insert() async {
    final db = await _database;
    final json = toDatabaseJson();
    // Remove id if it's null to let database auto-generate
    if (id == null) {
      json.remove(idField);
    }
    
    return await db.insert(
      tableName,
      json,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }
  
  /// Update entity in database
  Future<int> update() async {
    if (id == null) {
      throw Exception('Cannot update entity without ID');
    }
    
    final db = await _database;
    return await db.update(
      tableName,
      toDatabaseJson(),
      where: '$idField = ?',
      whereArgs: [id],
    );
  }
  
  /// Save entity (insert or update based on ID)
  Future<int> save() async {
    if (id == null) {
      return await insert();
    } else {
      return await update();
    }
  }
  
  /// Delete entity from database
  Future<int> delete() async {
    if (id == null) {
      throw Exception('Cannot delete entity without ID');
    }
    
    final db = await _database;
    return await db.delete(
      tableName,
      where: '$idField = ?',
      whereArgs: [id],
    );
  }
  
  /// Check if entity exists in database
  Future<bool> exists() async {
    if (id == null) return false;
    
    final db = await _database;
    final result = await db.query(
      tableName,
      columns: [idField],
      where: '$idField = ?',
      whereArgs: [id],
      limit: 1,
    );
    
    return result.isNotEmpty;
  }
  
  /// Refresh entity from database
  Future<void> refresh() async {
    if (id == null) {
      throw Exception('Cannot refresh entity without ID');
    }
    
    final db = await _database;
    final result = await db.query(
      tableName,
      where: '$idField = ?',
      whereArgs: [id],
      limit: 1,
    );
    
    if (result.isEmpty) {
      throw Exception('Entity not found in database');
    }
    
    // Update current instance with fresh data
    _updateFromDatabase(result.first);
  }
  
  /// Update current instance from database JSON
  /// Must be implemented by subclasses
  void _updateFromDatabase(Map<String, dynamic> json);
  
  /// Get all entities of this type
  static Future<List<T>> findAll<T extends BaseEntity>(String tableName) async {
    final ormService = OrmService();
    final db = await ormService.database;
    
    final result = await db.query(tableName);
    return result.map((json) => fromDatabase(json) as T).toList();
  }
  
  /// Find entity by ID
  static Future<T?> findById<T extends BaseEntity>(String tableName, int id) async {
    final ormService = OrmService();
    final db = await ormService.database;
    
    final result = await db.query(
      tableName,
      where: '$idField = ?',
      whereArgs: [id],
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    return fromDatabase(result.first) as T;
  }
  
  /// Find entities by field value
  static Future<List<T>> findByField<T extends BaseEntity>(
    String tableName,
    String field, 
    dynamic value
  ) async {
    final ormService = OrmService();
    final db = await ormService.database;
    
    final result = await db.query(
      tableName,
      where: '$field = ?',
      whereArgs: [value],
    );
    
    return result.map((json) => fromDatabase(json) as T).toList();
  }
  
  /// Count all entities
  static Future<int> count<T extends BaseEntity>(String tableName) async {
    final ormService = OrmService();
    final db = await ormService.database;
    
    final result = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName');
    return Sqflite.firstIntValue(result) ?? 0;
  }
  
  /// Delete all entities
  static Future<int> deleteAll<T extends BaseEntity>(String tableName) async {
    final ormService = OrmService();
    final db = await ormService.database;
    
    return await db.delete(tableName);
  }
  
  /// Bulk insert entities
  static Future<void> bulkInsert<T extends BaseEntity>(String tableName, List<T> entities) async {
    final ormService = OrmService();
    final db = await ormService.database;
    final batch = db.batch();
    
    for (final entity in entities) {
      final json = entity.toDatabaseJson();
      if (entity.id == null) {
        json.remove(idField);
      }
      
      batch.insert(
        tableName,
        json,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    
    await batch.commit();
  }
  
  /// Create query builder for this entity type
  static QueryBuilder<T> query<T extends BaseEntity>(String tableName) {
    return QueryBuilder<T>(tableName);
  }
}

/// Query builder for building complex database queries
class QueryBuilder<T extends BaseEntity> {
  final String _tableName;
  final List<String> _columns = [];
  final List<String> _whereConditions = [];
  final List<dynamic> _whereArgs = [];
  final List<String> _orderBy = [];
  final List<String> _groupBy = [];
  final List<String> _having = [];
  int? _limit;
  int? _offset;
  
  QueryBuilder(this._tableName);
  
  /// Select specific columns
  QueryBuilder<T> select(List<String> columns) {
    _columns.addAll(columns);
    return this;
  }
  
  /// Add WHERE condition
  QueryBuilder<T> where(String condition, [dynamic value]) {
    _whereConditions.add(condition);
    if (value != null) {
      _whereArgs.add(value);
    }
    return this;
  }
  
  /// Add WHERE IN condition
  QueryBuilder<T> whereIn(String field, List<dynamic> values) {
    if (values.isEmpty) return this;
    
    final placeholders = List.filled(values.length, '?').join(',');
    _whereConditions.add('$field IN ($placeholders)');
    _whereArgs.addAll(values);
    return this;
  }
  
  /// Add WHERE NOT IN condition
  QueryBuilder<T> whereNotIn(String field, List<dynamic> values) {
    if (values.isEmpty) return this;
    
    final placeholders = List.filled(values.length, '?').join(',');
    _whereConditions.add('$field NOT IN ($placeholders)');
    _whereArgs.addAll(values);
    return this;
  }
  
  /// Add WHERE LIKE condition
  QueryBuilder<T> whereLike(String field, String pattern) {
    _whereConditions.add('$field LIKE ?');
    _whereArgs.add(pattern);
    return this;
  }
  
  /// Add WHERE BETWEEN condition
  QueryBuilder<T> whereBetween(String field, dynamic start, dynamic end) {
    _whereConditions.add('$field BETWEEN ? AND ?');
    _whereArgs.addAll([start, end]);
    return this;
  }
  
  /// Add WHERE IS NULL condition
  QueryBuilder<T> whereNull(String field) {
    _whereConditions.add('$field IS NULL');
    return this;
  }
  
  /// Add WHERE IS NOT NULL condition
  QueryBuilder<T> whereNotNull(String field) {
    _whereConditions.add('$field IS NOT NULL');
    return this;
  }
  
  /// Add ORDER BY clause
  QueryBuilder<T> orderBy(String field, {bool ascending = true}) {
    _orderBy.add('$field ${ascending ? 'ASC' : 'DESC'}');
    return this;
  }
  
  /// Add GROUP BY clause
  QueryBuilder<T> groupBy(String field) {
    _groupBy.add(field);
    return this;
  }
  
  /// Add HAVING clause
  QueryBuilder<T> having(String condition) {
    _having.add(condition);
    return this;
  }
  
  /// Set LIMIT
  QueryBuilder<T> limit(int count) {
    _limit = count;
    return this;
  }
  
  /// Set OFFSET
  QueryBuilder<T> offset(int count) {
    _offset = count;
    return this;
  }
  
  /// Execute query and return results
  Future<List<Map<String, dynamic>>> execute(Database db) async {
    String sql = 'SELECT ';
    
    // Add columns
    if (_columns.isEmpty) {
      sql += '*';
    } else {
      sql += _columns.join(', ');
    }
    
    sql += ' FROM $_tableName';
    
    // Add WHERE clause
    if (_whereConditions.isNotEmpty) {
      sql += ' WHERE ${_whereConditions.join(' AND ')}';
    }
    
    // Add GROUP BY clause
    if (_groupBy.isNotEmpty) {
      sql += ' GROUP BY ${_groupBy.join(', ')}';
    }
    
    // Add HAVING clause
    if (_having.isNotEmpty) {
      sql += ' HAVING ${_having.join(' AND ')}';
    }
    
    // Add ORDER BY clause
    if (_orderBy.isNotEmpty) {
      sql += ' ORDER BY ${_orderBy.join(', ')}';
    }
    
    // Add LIMIT clause
    if (_limit != null) {
      sql += ' LIMIT $_limit';
      if (_offset != null) {
        sql += ' OFFSET $_offset';
      }
    }
    
    return await db.rawQuery(sql, _whereArgs);
  }
  
  /// Execute query and return count
  Future<int> count(Database db) async {
    String sql = 'SELECT COUNT(*) as count FROM $_tableName';
    
    if (_whereConditions.isNotEmpty) {
      sql += ' WHERE ${_whereConditions.join(' AND ')}';
    }
    
    if (_groupBy.isNotEmpty) {
      sql += ' GROUP BY ${_groupBy.join(', ')}';
    }
    
    if (_having.isNotEmpty) {
      sql += ' HAVING ${_having.join(' AND ')}';
    }
    
    final result = await db.rawQuery(sql, _whereArgs);
    return Sqflite.firstIntValue(result) ?? 0;
  }
  
  /// Execute query and return first result
  Future<Map<String, dynamic>?> first(Database db) async {
    final results = await limit(1).execute(db);
    return results.isNotEmpty ? results.first : null;
  }
}
