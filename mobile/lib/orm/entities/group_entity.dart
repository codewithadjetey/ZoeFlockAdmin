import '../base_entity.dart';
import '../repository.dart';
import '../../utils/constants.dart';

/// Group entity that extends BaseEntity for ORM functionality
class GroupEntity extends BaseEntity {
  @override
  String get tableName => 'groups';

  final int? _id;
  final String name;
  final String? description;
  final String? color;
  final String? icon;
  final int? leaderId;
  final String? leaderName;
  final int memberCount;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  @override
  int? get id => _id;

  const GroupEntity({
    int? id,
    required this.name,
    this.description,
    this.color,
    this.icon,
    this.leaderId,
    this.leaderName,
    this.memberCount = 0,
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  }) : _id = id;

  bool get hasLeader => leaderId != null;
  bool get isEmpty => memberCount == 0;
  bool get isLarge => memberCount > 20;

  @override
  Map<String, dynamic> toDatabaseJson() {
    return {
      if (_id != null) 'id': _id,
      'name': name,
      'description': description,
      'color': color,
      'icon': icon,
      'leader_id': leaderId,
      'leader_name': leaderName,
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

  static GroupEntity fromDatabase(Map<String, dynamic> json) {
    return GroupEntity(
      id: json['id'] as int?,
      name: json['name'] as String? ?? '',
      description: json['description'] as String?,
      color: json['color'] as String?,
      icon: json['icon'] as String?,
      leaderId: json['leader_id'] as int?,
      leaderName: json['leader_name'] as String?,
      memberCount: json['member_count'] as int? ?? 0,
      isActive: (json['is_active'] as int? ?? 1) == 1,
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at'] as int),
    );
  }

  factory GroupEntity.fromJson(Map<String, dynamic> json) {
    return GroupEntity(
      id: json['id'] as int?,
      name: json['name'] as String? ?? '',
      description: json['description'] as String?,
      color: json['color'] as String?,
      icon: json['icon'] as String?,
      leaderId: json['leader_id'] as int?,
      leaderName: json['leader_name'] as String?,
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
      'color': color,
      'icon': icon,
      'leader_id': leaderId,
      'leader_name': leaderName,
      'member_count': memberCount,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  GroupEntity copyWith({
    int? id,
    String? name,
    String? description,
    String? color,
    String? icon,
    int? leaderId,
    String? leaderName,
    int? memberCount,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return GroupEntity(
      id: id ?? _id,
      name: name ?? this.name,
      description: description ?? this.description,
      color: color ?? this.color,
      icon: icon ?? this.icon,
      leaderId: leaderId ?? this.leaderId,
      leaderName: leaderName ?? this.leaderName,
      memberCount: memberCount ?? this.memberCount,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GroupEntity && other._id == _id;
  }

  @override
  int get hashCode => _id.hashCode;

  @override
  String toString() {
    return 'GroupEntity(id: $_id, name: $name, memberCount: $memberCount, isActive: $isActive)';
  }
}

/// Group repository for database operations
class GroupRepository extends BaseRepository<GroupEntity> {
  @override
  String get tableName => 'groups';

  @override
  GroupEntity fromDatabaseJson(Map<String, dynamic> json) {
    return GroupEntity.fromDatabase(json);
  }

  /// Find group by name
  Future<GroupEntity?> findByName(String name) async {
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

  /// Find groups by leader
  Future<List<GroupEntity>> findByLeader(int leaderId) async {
    return await findByField('leader_id', leaderId, orderBy: 'name ASC');
  }

  /// Find active groups
  Future<List<GroupEntity>> findActiveGroups() async {
    return await findByField('is_active', 1, orderBy: 'name ASC');
  }

  /// Find inactive groups
  Future<List<GroupEntity>> findInactiveGroups() async {
    return await findByField('is_active', 0, orderBy: 'name ASC');
  }

  /// Find groups with members
  Future<List<GroupEntity>> findGroupsWithMembers() async {
    return await findWhere('member_count > 0', [], orderBy: 'member_count DESC');
  }

  /// Find empty groups
  Future<List<GroupEntity>> findEmptyGroups() async {
    return await findByField('member_count', 0, orderBy: 'name ASC');
  }

  /// Search groups by name or description
  Future<List<GroupEntity>> search(String query) async {
    return await search(query, ['name', 'description']);
  }

  /// Update member count for a group
  Future<int> updateMemberCount(int groupId, int count) async {
    final db = await database;
    return await db.update(
      tableName,
      {
        'member_count': count,
        'updated_at': DateTime.now().millisecondsSinceEpoch,
      },
      where: 'id = ?',
      whereArgs: [groupId],
    );
  }

  /// Increment member count
  Future<int> incrementMemberCount(int groupId) async {
    final db = await database;
    return await db.rawUpdate(
      'UPDATE $tableName SET member_count = member_count + 1, updated_at = ? WHERE id = ?',
      [DateTime.now().millisecondsSinceEpoch, groupId],
    );
  }

  /// Decrement member count
  Future<int> decrementMemberCount(int groupId) async {
    final db = await database;
    return await db.rawUpdate(
      'UPDATE $tableName SET member_count = GREATEST(member_count - 1, 0), updated_at = ? WHERE id = ?',
      [DateTime.now().millisecondsSinceEpoch, groupId],
    );
  }

  /// Get group statistics
  Future<Map<String, int>> getGroupStatistics() async {
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

  /// Get groups with pagination
  Future<List<GroupEntity>> getGroupsPaginated({
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
      whereConditions.add('(name LIKE ? OR description LIKE ?)');
      whereArgs.addAll(['%$search%', '%$search%']);
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
