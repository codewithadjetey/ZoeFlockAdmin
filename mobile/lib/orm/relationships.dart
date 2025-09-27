import 'package:sqflite/sqflite.dart';
import 'base_entity.dart';
import 'orm_service.dart';

/// Relationship types for entity associations
enum RelationshipType {
  oneToOne,
  oneToMany,
  manyToMany,
}

/// Direction of the relationship
enum RelationshipDirection {
  belongsTo,
  hasOne,
  hasMany,
  manyToMany,
}

/// Base relationship class
abstract class Relationship<T extends BaseEntity> {
  final String name;
  final RelationshipType type;
  final RelationshipDirection direction;
  final String foreignKey;
  final String? localKey;
  final String? throughTable;
  final String? throughForeignKey;
  final String? throughLocalKey;

  const Relationship({
    required this.name,
    required this.type,
    required this.direction,
    required this.foreignKey,
    this.localKey,
    this.throughTable,
    this.throughForeignKey,
    this.throughLocalKey,
  });

  /// Load the related entity/entities
  Future<dynamic> load(BaseEntity entity);
}

/// One-to-One relationship
class HasOne<T extends BaseEntity> extends Relationship<T> {
  final T Function(Map<String, dynamic>) fromDatabaseJson;

  const HasOne({
    required super.name,
    required super.foreignKey,
    super.localKey,
    required this.fromDatabaseJson,
  }) : super(
          type: RelationshipType.oneToOne,
          direction: RelationshipDirection.hasOne,
        );

  @override
  Future<T?> load(BaseEntity entity) async {
    final ormService = OrmService();
    final db = await ormService.database;
    
    final localKeyValue = entity.toDatabaseJson()[localKey ?? 'id'];
    if (localKeyValue == null) return null;
    
    final result = await db.query(
      (entity as dynamic).tableName,
      where: '$foreignKey = ?',
      whereArgs: [localKeyValue],
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    return fromDatabaseJson(result.first);
  }
}

/// One-to-Many relationship
class HasMany<T extends BaseEntity> extends Relationship<T> {
  final T Function(Map<String, dynamic>) fromDatabaseJson;
  final String? orderBy;

  const HasMany({
    required super.name,
    required super.foreignKey,
    super.localKey,
    this.orderBy,
    required this.fromDatabaseJson,
  }) : super(
          type: RelationshipType.oneToMany,
          direction: RelationshipDirection.hasMany,
        );

  @override
  Future<List<T>> load(BaseEntity entity) async {
    final ormService = OrmService();
    final db = await ormService.database;
    
    final localKeyValue = entity.toDatabaseJson()[localKey ?? 'id'];
    if (localKeyValue == null) return [];
    
    final result = await db.query(
      (entity as dynamic).tableName,
      where: '$foreignKey = ?',
      whereArgs: [localKeyValue],
      orderBy: orderBy,
    );
    
    return result.map((json) => fromDatabaseJson(json)).toList();
  }
}

/// Many-to-Many relationship
class BelongsToMany<T extends BaseEntity> extends Relationship<T> {
  final T Function(Map<String, dynamic>) fromDatabaseJson;
  final String? orderBy;

  const BelongsToMany({
    required super.name,
    required super.throughTable,
    required super.throughForeignKey,
    required super.throughLocalKey,
    super.localKey,
    this.orderBy,
    required this.fromDatabaseJson,
  }) : super(
          type: RelationshipType.manyToMany,
          direction: RelationshipDirection.manyToMany,
        );

  @override
  Future<List<T>> load(BaseEntity entity) async {
    final ormService = OrmService();
    final db = await ormService.database;
    
    final localKeyValue = entity.toDatabaseJson()[localKey ?? 'id'];
    if (localKeyValue == null) return [];
    
    final sql = '''
      SELECT t.* FROM ${(entity as dynamic).tableName} t
      INNER JOIN $throughTable tt ON t.id = tt.$throughForeignKey
      WHERE tt.$throughLocalKey = ?
      ${orderBy != null ? 'ORDER BY t.$orderBy' : ''}
    ''';
    
    final result = await db.rawQuery(sql, [localKeyValue]);
    return result.map((json) => fromDatabaseJson(json)).toList();
  }
}

/// Belongs to relationship
class BelongsTo<T extends BaseEntity> extends Relationship<T> {
  final T Function(Map<String, dynamic>) fromDatabaseJson;

  const BelongsTo({
    required super.name,
    required super.foreignKey,
    required this.fromDatabaseJson,
  }) : super(
          type: RelationshipType.oneToOne,
          direction: RelationshipDirection.belongsTo,
        );

  @override
  Future<T?> load(BaseEntity entity) async {
    final ormService = OrmService();
    final db = await ormService.database;
    
    final foreignKeyValue = entity.toDatabaseJson()[foreignKey];
    if (foreignKeyValue == null) return null;
    
    final result = await db.query(
      (entity as dynamic).tableName,
      where: 'id = ?',
      whereArgs: [foreignKeyValue],
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    return fromDatabaseJson(result.first);
  }
}

/// Relationship manager for handling entity relationships
class RelationshipManager {
  final Map<Type, Map<String, Relationship>> _relationships = {};
  final Map<BaseEntity, Map<String, dynamic>> _loadedRelations = {};

  /// Define a relationship for an entity type
  void define<T extends BaseEntity>(String name, Relationship relationship) {
    _relationships.putIfAbsent(T, () => {});
    _relationships[T]![name] = relationship;
  }

  /// Load a relationship for an entity
  Future<dynamic> load<T extends BaseEntity>(T entity, String relationshipName) async {
    final entityType = entity.runtimeType;
    final relationships = _relationships[entityType];
    
    if (relationships == null || !relationships.containsKey(relationshipName)) {
      throw Exception('Relationship "$relationshipName" not defined for ${entityType.toString()}');
    }

    // Check if already loaded
    final entityKey = _getEntityKey(entity);
    if (_loadedRelations.containsKey(entityKey) && 
        _loadedRelations[entityKey]!.containsKey(relationshipName)) {
      return _loadedRelations[entityKey]![relationshipName];
    }

    // Load the relationship
    final relationship = relationships[relationshipName]!;
    final result = await relationship.load(entity);

    // Cache the result
    _loadedRelations.putIfAbsent(entityKey, () => {});
    _loadedRelations[entityKey]![relationshipName] = result;

    return result;
  }

  /// Load multiple relationships for an entity
  Future<Map<String, dynamic>> loadMany<T extends BaseEntity>(
    T entity, 
    List<String> relationshipNames
  ) async {
    final results = <String, dynamic>{};
    
    for (final name in relationshipNames) {
      results[name] = await load(entity, name);
    }
    
    return results;
  }

  /// Eager load relationships for multiple entities
  Future<List<T>> eagerLoad<T extends BaseEntity>(
    List<T> entities, 
    List<String> relationshipNames
  ) async {
    for (final entity in entities) {
      await loadMany(entity, relationshipNames);
    }
    return entities;
  }

  /// Clear loaded relationships for an entity
  void clearRelations(BaseEntity entity) {
    final entityKey = _getEntityKey(entity);
    _loadedRelations.remove(entityKey);
  }

  /// Clear all loaded relationships
  void clearAllRelations() {
    _loadedRelations.clear();
  }

  /// Get entity key for caching
  String _getEntityKey(BaseEntity entity) {
    return '${entity.runtimeType}_${entity.id}';
  }

  /// Check if relationship is defined
  bool hasRelationship<T extends BaseEntity>(String name) {
    final relationships = _relationships[T];
    return relationships != null && relationships.containsKey(name);
  }

  /// Get all defined relationships for an entity type
  List<String> getRelationships<T extends BaseEntity>() {
    final relationships = _relationships[T];
    return relationships?.keys.toList() ?? [];
  }
}

/// Mixin for entities that support relationships
mixin RelationshipMixin on BaseEntity {
  static final RelationshipManager _relationshipManager = RelationshipManager();

  /// Load a relationship
  Future<dynamic> load(String relationshipName) async {
    return await _relationshipManager.load(this, relationshipName);
  }

  /// Load multiple relationships
  Future<Map<String, dynamic>> loadMany(List<String> relationshipNames) async {
    return await _relationshipManager.loadMany(this, relationshipNames);
  }

  /// Clear loaded relationships
  void clearRelations() {
    _relationshipManager.clearRelations(this);
  }

  /// Check if relationship is loaded
  bool hasLoadedRelation(String relationshipName) {
    final entityKey = '${runtimeType}_$id';
    return _relationshipManager._loadedRelations.containsKey(entityKey) &&
           _relationshipManager._loadedRelations[entityKey]!.containsKey(relationshipName);
  }

  /// Get loaded relationship
  dynamic getLoadedRelation(String relationshipName) {
    final entityKey = '${runtimeType}_$id';
    return _relationshipManager._loadedRelations[entityKey]?[relationshipName];
  }
}

/// Relationship definitions for common entities
class RelationshipDefinitions {
  static void defineMemberRelationships() {
    final relationshipManager = RelationshipManager();
    
    // Member has many attendances
    relationshipManager.define<dynamic>('attendances', HasMany(
      name: 'attendances',
      foreignKey: 'member_id',
      fromDatabaseJson: (json) => json, // This would be AttendanceEntity.fromDatabase
    ));

    // Member belongs to group
    relationshipManager.define<dynamic>('group', BelongsTo(
      name: 'group',
      foreignKey: 'group_id',
      fromDatabaseJson: (json) => json, // This would be GroupEntity.fromDatabase
    ));

    // Member belongs to family
    relationshipManager.define<dynamic>('family', BelongsTo(
      name: 'family',
      foreignKey: 'family_id',
      fromDatabaseJson: (json) => json, // This would be FamilyEntity.fromDatabase
    ));
  }

  static void defineEventRelationships() {
    final relationshipManager = RelationshipManager();
    
    // Event has many attendances
    relationshipManager.define<dynamic>('attendances', HasMany(
      name: 'attendances',
      foreignKey: 'event_id',
      fromDatabaseJson: (json) => json, // This would be AttendanceEntity.fromDatabase
    ));
  }

  static void defineAttendanceRelationships() {
    final relationshipManager = RelationshipManager();
    
    // Attendance belongs to member
    relationshipManager.define<dynamic>('member', BelongsTo(
      name: 'member',
      foreignKey: 'member_id',
      fromDatabaseJson: (json) => json, // This would be MemberEntity.fromDatabase
    ));

    // Attendance belongs to event
    relationshipManager.define<dynamic>('event', BelongsTo(
      name: 'event',
      foreignKey: 'event_id',
      fromDatabaseJson: (json) => json, // This would be EventEntity.fromDatabase
    ));
  }

  static void defineAllRelationships() {
    defineMemberRelationships();
    defineEventRelationships();
    defineAttendanceRelationships();
  }
}
