import '../base_entity.dart';
import '../repository.dart';
import '../../utils/constants.dart';

/// Family entity that extends BaseEntity for ORM functionality
class FamilyEntity extends BaseEntity {
  @override
  String get tableName => 'families';

  final int? _id;
  final String name;
  final String? description;
  final String? address;
  final String? phone;
  final String? email;
  final int? headOfFamilyId;
  final String? headOfFamilyName;
  final int memberCount;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  @override
  int? get id => _id;

  const FamilyEntity({
    int? id,
    required this.name,
    this.description,
    this.address,
    this.phone,
    this.email,
    this.headOfFamilyId,
    this.headOfFamilyName,
    this.memberCount = 0,
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  }) : _id = id;

  bool get hasHeadOfFamily => headOfFamilyId != null;
  bool get isEmpty => memberCount == 0;
  bool get isLarge => memberCount > 5;

  @override
  Map<String, dynamic> toDatabaseJson() {
    return {
      if (_id != null) 'id': _id,
      'name': name,
      'description': description,
      'address': address,
      'phone': phone,
      'email': email,
      'head_of_family_id': headOfFamilyId,
      'head_of_family_name': headOfFamilyName,
      'member_count': memberCount,
      'is_active': isActive ? 1 : 0,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  @override
  void _updateFromDatabase(Map<String, dynamic> json) {
    // This method would update the current instance
    // Since we're using immutable entities, we'll create a new instance
  }

  static FamilyEntity fromDatabase(Map<String, dynamic> json) {
    return FamilyEntity(
      id: json['id'] as int?,
      name: json['name'] as String? ?? '',
      description: json['description'] as String?,
      address: json['address'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      headOfFamilyId: json['head_of_family_id'] as int?,
      headOfFamilyName: json['head_of_family_name'] as String?,
      memberCount: json['member_count'] as int? ?? 0,
      isActive: (json['is_active'] as int? ?? 1) == 1,
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at'] as int),
    );
  }

  factory FamilyEntity.fromJson(Map<String, dynamic> json) {
    return FamilyEntity(
      id: json['id'] as int?,
      name: json['name'] as String? ?? '',
      description: json['description'] as String?,
      address: json['address'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      headOfFamilyId: json['head_of_family_id'] as int?,
      headOfFamilyName: json['head_of_family_name'] as String?,
      memberCount: json['member_count'] as int? ?? 0,
      isActive: json['is_active'] as bool? ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (_id != null) 'id': _id,
      'name': name,
      'description': description,
      'address': address,
      'phone': phone,
      'email': email,
      'head_of_family_id': headOfFamilyId,
      'head_of_family_name': headOfFamilyName,
      'member_count': memberCount,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  FamilyEntity copyWith({
    int? id,
    String? name,
    String? description,
    String? address,
    String? phone,
    String? email,
    int? headOfFamilyId,
    String? headOfFamilyName,
    int? memberCount,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return FamilyEntity(
      id: id ?? _id,
      name: name ?? this.name,
      description: description ?? this.description,
      address: address ?? this.address,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      headOfFamilyId: headOfFamilyId ?? this.headOfFamilyId,
      headOfFamilyName: headOfFamilyName ?? this.headOfFamilyName,
      memberCount: memberCount ?? this.memberCount,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is FamilyEntity && other._id == _id;
  }

  @override
  int get hashCode => _id.hashCode;

  @override
  String toString() {
    return 'FamilyEntity(id: $_id, name: $name, memberCount: $memberCount, isActive: $isActive)';
  }
}

/// Family repository for database operations
class FamilyRepository extends BaseRepository<FamilyEntity> {
  @override
  String get tableName => 'families';

  @override
  FamilyEntity fromDatabaseJson(Map<String, dynamic> json) {
    return FamilyEntity.fromDatabase(json);
  }

  /// Find family by name
  Future<FamilyEntity?> findByName(String name) async {
    final db = await database;
    final result = await db.query(
      tableName,
      where: 'name = ?',
      whereArgs: [name],
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    return fromDatabaseJson(result.first);
  }

  /// Find families by head of family
  Future<List<FamilyEntity>> findByHeadOfFamily(int headOfFamilyId) async {
    return await findByField('head_of_family_id', headOfFamilyId, orderBy: 'name ASC');
  }

  /// Find active families
  Future<List<FamilyEntity>> findActiveFamilies() async {
    return await findByField('is_active', 1, orderBy: 'name ASC');
  }

  /// Find inactive families
  Future<List<FamilyEntity>> findInactiveFamilies() async {
    return await findByField('is_active', 0, orderBy: 'name ASC');
  }

  /// Find families with members
  Future<List<FamilyEntity>> findFamiliesWithMembers() async {
    return await findWhere('member_count > 0', [], orderBy: 'member_count DESC');
  }

  /// Find empty families
  Future<List<FamilyEntity>> findEmptyFamilies() async {
    return await findByField('member_count', 0, orderBy: 'name ASC');
  }

  /// Search families by name, description, or address
  Future<List<FamilyEntity>> search(String query) async {
    return await search(query, ['name', 'description', 'address']);
  }

  /// Update member count for a family
  Future<int> updateMemberCount(int familyId, int count) async {
    final db = await database;
    return await db.update(
      tableName,
      {
        'member_count': count,
        'updated_at': DateTime.now().millisecondsSinceEpoch,
      },
      where: 'id = ?',
      whereArgs: [familyId],
    );
  }

  /// Increment member count
  Future<int> incrementMemberCount(int familyId) async {
    final db = await database;
    return await db.rawUpdate(
      'UPDATE $tableName SET member_count = member_count + 1, updated_at = ? WHERE id = ?',
      [DateTime.now().millisecondsSinceEpoch, familyId],
    );
  }

  /// Decrement member count
  Future<int> decrementMemberCount(int familyId) async {
    final db = await database;
    return await db.rawUpdate(
      'UPDATE $tableName SET member_count = GREATEST(member_count - 1, 0), updated_at = ? WHERE id = ?',
      [DateTime.now().millisecondsSinceEpoch, familyId],
    );
  }

  /// Get family statistics
  Future<Map<String, int>> getFamilyStatistics() async {
    final db = await database;
    
    final totalResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName');
    final activeResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE is_active = 1');
    final withMembersResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE member_count > 0');
    final emptyResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE member_count = 0');
    
    return {
      'total': totalResult.first['count'] as int,
      'active': activeResult.first['count'] as int,
      'with_members': withMembersResult.first['count'] as int,
      'empty': emptyResult.first['count'] as int,
    };
  }

  /// Get families with pagination
  Future<List<FamilyEntity>> getFamiliesPaginated({
    int page = 1,
    int perPage = 20,
    String? search,
    bool? isActive,
    bool? hasMembers,
  }) async {
    final offset = (page - 1) * perPage;
    final db = await database;
    
    final whereConditions = <String>[];
    final whereArgs = <dynamic>[];
    
    if (search != null && search.isNotEmpty) {
      whereConditions.add('(name LIKE ? OR description LIKE ? OR address LIKE ?)');
      whereArgs.addAll(['%$search%', '%$search%', '%$search%']);
    }
    
    if (isActive != null) {
      whereConditions.add('is_active = ?');
      whereArgs.add(isActive ? 1 : 0);
    }
    
    if (hasMembers != null) {
      if (hasMembers) {
        whereConditions.add('member_count > 0');
      } else {
        whereConditions.add('member_count = 0');
      }
    }
    
    final where = whereConditions.isNotEmpty ? whereConditions.join(' AND ') : null;
    
    final result = await db.query(
      tableName,
      where: where,
      whereArgs: whereArgs.isNotEmpty ? whereArgs : null,
      orderBy: 'name ASC',
      limit: perPage,
      offset: offset,
    );
    
    return result.map((json) => fromDatabaseJson(json)).toList();
  }
}
