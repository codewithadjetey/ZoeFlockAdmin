import 'package:sqflite/sqflite.dart';
import 'base_entity.dart';

/// Repository interface for data access abstraction
abstract class Repository<T extends BaseEntity> {
  /// Get database instance
  Future<Database> get database;
  
  /// Get table name
  String get tableName;
  
  /// Create entity from database JSON
  T fromDatabaseJson(Map<String, dynamic> json);
  
  /// Find entity by ID
  Future<T?> findById(int id) async {
    final db = await database;
    final result = await db.query(
      tableName,
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    return fromDatabaseJson(result.first);
  }
  
  /// Find all entities
  Future<List<T>> findAll({String? orderBy}) async {
    final db = await database;
    final result = await db.query(
      tableName,
      orderBy: orderBy,
    );
    
    return result.map((json) => fromDatabaseJson(json)).toList();
  }
  
  /// Find entities by field
  Future<List<T>> findByField(String field, dynamic value, {String? orderBy}) async {
    final db = await database;
    final result = await db.query(
      tableName,
      where: '$field = ?',
      whereArgs: [value],
      orderBy: orderBy,
    );
    
    return result.map((json) => fromDatabaseJson(json)).toList();
  }
  
  /// Find entities by multiple fields
  Future<List<T>> findByFields(Map<String, dynamic> fields, {String? orderBy}) async {
    final db = await database;
    final whereConditions = fields.keys.map((key) => '$key = ?').join(' AND ');
    final whereArgs = fields.values.toList();
    
    final result = await db.query(
      tableName,
      where: whereConditions,
      whereArgs: whereArgs,
      orderBy: orderBy,
    );
    
    return result.map((json) => fromDatabaseJson(json)).toList();
  }
  
  /// Find entities with custom query
  Future<List<T>> findWhere(String where, List<dynamic> whereArgs, {String? orderBy}) async {
    final db = await database;
    final result = await db.query(
      tableName,
      where: where,
      whereArgs: whereArgs,
      orderBy: orderBy,
    );
    
    return result.map((json) => fromDatabaseJson(json)).toList();
  }
  
  /// Count all entities
  Future<int> count() async {
    final db = await database;
    final result = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName');
    return Sqflite.firstIntValue(result) ?? 0;
  }
  
  /// Count entities by field
  Future<int> countByField(String field, dynamic value) async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM $tableName WHERE $field = ?',
      [value],
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }
  
  /// Count entities with custom query
  Future<int> countWhere(String where, List<dynamic> whereArgs) async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM $tableName WHERE $where',
      whereArgs,
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }
  
  /// Insert entity
  Future<int> insert(T entity) async {
    final db = await database;
    final json = entity.toDatabaseJson();
    // Remove id if it's null to let database auto-generate
    if (entity.id == null) {
      json.remove('id');
    }
    
    return await db.insert(
      tableName,
      json,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }
  
  /// Update entity
  Future<int> update(T entity) async {
    if (entity.id == null) {
      throw Exception('Cannot update entity without ID');
    }
    
    final db = await database;
    return await db.update(
      tableName,
      entity.toDatabaseJson(),
      where: 'id = ?',
      whereArgs: [entity.id],
    );
  }
  
  /// Save entity (insert or update)
  Future<int> save(T entity) async {
    if (entity.id == null) {
      return await insert(entity);
    } else {
      return await update(entity);
    }
  }
  
  /// Delete entity
  Future<int> delete(T entity) async {
    if (entity.id == null) {
      throw Exception('Cannot delete entity without ID');
    }
    
    final db = await database;
    return await db.delete(
      tableName,
      where: 'id = ?',
      whereArgs: [entity.id],
    );
  }
  
  /// Delete entity by ID
  Future<int> deleteById(int id) async {
    final db = await database;
    return await db.delete(
      tableName,
      where: 'id = ?',
      whereArgs: [id],
    );
  }
  
  /// Delete entities by field
  Future<int> deleteByField(String field, dynamic value) async {
    final db = await database;
    return await db.delete(
      tableName,
      where: '$field = ?',
      whereArgs: [value],
    );
  }
  
  /// Delete all entities
  Future<int> deleteAll() async {
    final db = await database;
    return await db.delete(tableName);
  }
  
  /// Bulk insert entities
  Future<void> bulkInsert(List<T> entities) async {
    final db = await database;
    final batch = db.batch();
    
    for (final entity in entities) {
      final json = entity.toDatabaseJson();
      if (entity.id == null) {
        json.remove('id');
      }
      
      batch.insert(
        tableName,
        json,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    
    await batch.commit();
  }
  
  /// Bulk update entities
  Future<void> bulkUpdate(List<T> entities) async {
    final db = await database;
    final batch = db.batch();
    
    for (final entity in entities) {
      if (entity.id == null) continue;
      
      batch.update(
        tableName,
        entity.toDatabaseJson(),
        where: 'id = ?',
        whereArgs: [entity.id],
      );
    }
    
    await batch.commit();
  }
  
  /// Check if entity exists
  Future<bool> exists(int id) async {
    final db = await database;
    final result = await db.query(
      tableName,
      columns: ['id'],
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );
    
    return result.isNotEmpty;
  }
  
  /// Check if entity exists by field
  Future<bool> existsByField(String field, dynamic value) async {
    final db = await database;
    final result = await db.query(
      tableName,
      columns: ['id'],
      where: '$field = ?',
      whereArgs: [value],
      limit: 1,
    );
    
    return result.isNotEmpty;
  }
  
  /// Get first entity
  Future<T?> first({String? orderBy}) async {
    final db = await database;
    final result = await db.query(
      tableName,
      orderBy: orderBy,
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    return fromDatabaseJson(result.first);
  }
  
  /// Get last entity
  Future<T?> last({String? orderBy}) async {
    final db = await database;
    final result = await db.query(
      tableName,
      orderBy: orderBy,
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    return fromDatabaseJson(result.first);
  }
  
  /// Paginate results
  Future<List<T>> paginate({
    int page = 1,
    int perPage = 20,
    String? orderBy,
    String? where,
    List<dynamic>? whereArgs,
  }) async {
    final offset = (page - 1) * perPage;
    final db = await database;
    
    final result = await db.query(
      tableName,
      where: where,
      whereArgs: whereArgs,
      orderBy: orderBy,
      limit: perPage,
      offset: offset,
    );
    
    return result.map((json) => fromDatabaseJson(json)).toList();
  }
  
  /// Search entities
  Future<List<T>> search(String query, List<String> fields, {String? orderBy}) async {
    final db = await database;
    final whereConditions = fields.map((field) => '$field LIKE ?').join(' OR ');
    final whereArgs = List.filled(fields.length, '%$query%');
    
    final result = await db.query(
      tableName,
      where: whereConditions,
      whereArgs: whereArgs,
      orderBy: orderBy,
    );
    
    return result.map((json) => fromDatabaseJson(json)).toList();
  }
  
  /// Execute raw query
  Future<List<Map<String, dynamic>>> rawQuery(String sql, [List<dynamic>? arguments]) async {
    final db = await database;
    return await db.rawQuery(sql, arguments);
  }
  
  /// Execute raw update
  Future<int> rawUpdate(String sql, [List<dynamic>? arguments]) async {
    final db = await database;
    return await db.rawUpdate(sql, arguments);
  }
  
  /// Execute raw delete
  Future<int> rawDelete(String sql, [List<dynamic>? arguments]) async {
    final db = await database;
    return await db.rawDelete(sql, arguments);
  }
  
  /// Create query builder
  QueryBuilder<T> query() {
    return QueryBuilder<T>(tableName);
  }
}
