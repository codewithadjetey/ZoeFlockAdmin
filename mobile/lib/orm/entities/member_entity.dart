import '../base_entity.dart';
import '../base_repository.dart';
import '../../utils/constants.dart';

/// Member entity that extends BaseEntity for ORM functionality
class MemberEntity extends BaseEntity {
  @override
  String get tableName => DatabaseConstants.membersTable;

  final int? _id;
  final String firstName;
  final String lastName;
  final String email;
  final String? profileImagePath;
  final String memberIdentificationId;
  final String? group;
  final String? family;
  final String? gender;
  final String? phone;
  final DateTime? dateOfBirth;
  final String status;
  final DateTime? lastAttendanceDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  @override
  int? get id => _id;

  MemberEntity({
    int? id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.profileImagePath,
    required this.memberIdentificationId,
    this.group,
    this.family,
    this.gender,
    this.phone,
    this.dateOfBirth,
    required this.status,
    this.lastAttendanceDate,
    required this.createdAt,
    required this.updatedAt,
  }) : _id = id;

  String get fullName => '$firstName $lastName';
  
  String get initials {
    final firstInitial = firstName.isNotEmpty ? firstName[0].toUpperCase() : '';
    final lastInitial = lastName.isNotEmpty ? lastName[0].toUpperCase() : '';
    return '$firstInitial$lastInitial';
  }

  bool get isActive => status.toLowerCase() == 'active';

  @override
  Map<String, dynamic> toDatabaseJson() {
    return {
      if (_id != null) 'id': _id,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'profile_image_path': profileImagePath ?? '',
      'member_identification_id': memberIdentificationId,
      'group_name': group ?? '',
      'family': family ?? '',
      'gender': gender ?? '',
      'phone': phone ?? '',
      'date_of_birth': dateOfBirth?.millisecondsSinceEpoch,
      'status': status,
      'last_attendance_date': lastAttendanceDate?.millisecondsSinceEpoch,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  @override
  void _updateFromDatabase(Map<String, dynamic> json) {
    // This method would update the current instance
    // Since we're using immutable entities, we'll create a new instance
    // This is a limitation of the current design - in a real implementation,
    // you might want to use mutable entities or return new instances
  }

  static MemberEntity fromDatabase(Map<String, dynamic> json) {
    return MemberEntity(
      id: json['id'] as int?,
      firstName: json['first_name'] as String? ?? '',
      lastName: json['last_name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      profileImagePath: json['profile_image_path'] as String?,
      memberIdentificationId: json['member_identification_id'] as String? ?? '',
      group: json['group_name'] as String?,
      family: json['family'] as String?,
      gender: json['gender'] as String?,
      phone: json['phone'] as String?,
      dateOfBirth: json['date_of_birth'] != null
          ? DateTime.fromMillisecondsSinceEpoch(json['date_of_birth'] as int)
          : null,
      status: json['status'] as String? ?? 'inactive',
      lastAttendanceDate: json['last_attendance_date'] != null
          ? DateTime.fromMillisecondsSinceEpoch(json['last_attendance_date'] as int)
          : null,
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at'] as int),
    );
  }

  factory MemberEntity.fromJson(Map<String, dynamic> json) {
    // Helper function to safely convert to string
    String? safeString(dynamic value) {
      if (value == null) return null;
      if (value is String) return value;
      if (value is List) {
        return value.isNotEmpty ? value.first.toString() : null;
      }
      return value.toString();
    }
    
    // Handle both 'name' field (from login response) and separate 'first_name'/'last_name' fields
    String firstName = '';
    String lastName = '';
    
    if (json.containsKey('name') && json['name'] != null) {
      final nameValue = safeString(json['name']);
      if (nameValue != null) {
        final nameParts = nameValue.split(' ');
        firstName = nameParts.isNotEmpty ? nameParts.first : '';
        lastName = nameParts.length > 1 ? nameParts.skip(1).join(' ') : '';
      }
    } else {
      firstName = safeString(json['first_name']) ?? '';
      lastName = safeString(json['last_name']) ?? '';
    }
    
    return MemberEntity(
      id: json['id'] as int?,
      firstName: firstName,
      lastName: lastName,
      email: safeString(json['email']) ?? '',
      profileImagePath: safeString(json['profile_picture']) ?? safeString(json['profile_image_path']),
      memberIdentificationId: safeString(json['member_identification_id']) ?? '',
      group: safeString(json['group']),
      family: safeString(json['family']),
      gender: safeString(json['gender']),
      phone: safeString(json['phone']),
      dateOfBirth: json['date_of_birth'] != null 
          ? DateTime.parse(safeString(json['date_of_birth']) ?? '')
          : null,
      status: json['is_active'] == true ? 'active' : safeString(json['status']) ?? 'inactive',
      lastAttendanceDate: json['last_attendance_date'] != null
          ? DateTime.parse(safeString(json['last_attendance_date']) ?? '')
          : null,
      createdAt: json['created_at'] != null 
          ? DateTime.parse(safeString(json['created_at']) ?? '')
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(safeString(json['updated_at']) ?? '')
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (_id != null) 'id': _id,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'profile_image_path': profileImagePath,
      'member_identification_id': memberIdentificationId,
      'group': group,
      'family': family,
      'gender': gender,
      'phone': phone,
      'date_of_birth': dateOfBirth?.toIso8601String(),
      'status': status,
      'last_attendance_date': lastAttendanceDate?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  MemberEntity copyWith({
    int? id,
    String? firstName,
    String? lastName,
    String? email,
    String? profileImagePath,
    String? memberIdentificationId,
    String? group,
    String? family,
    String? gender,
    String? phone,
    DateTime? dateOfBirth,
    String? status,
    DateTime? lastAttendanceDate,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return MemberEntity(
      id: id ?? _id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      profileImagePath: profileImagePath ?? this.profileImagePath,
      memberIdentificationId: memberIdentificationId ?? this.memberIdentificationId,
      group: group ?? this.group,
      family: family ?? this.family,
      gender: gender ?? this.gender,
      phone: phone ?? this.phone,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      status: status ?? this.status,
      lastAttendanceDate: lastAttendanceDate ?? this.lastAttendanceDate,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is MemberEntity && other._id == _id;
  }

  @override
  int get hashCode => _id.hashCode;

  @override
  String toString() {
    return 'MemberEntity(id: $_id, name: $fullName, email: $email, memberId: $memberIdentificationId)';
  }
}

/// Member repository for database operations
class MemberRepository extends BaseRepository<MemberEntity> {
  @override
  String get tableName => DatabaseConstants.membersTable;

  @override
  MemberEntity fromDatabaseJson(Map<String, dynamic> json) {
    return MemberEntity.fromDatabase(json);
  }

  /// Find member by identification ID
  Future<MemberEntity?> findByIdentificationId(String identificationId) async {
    final db = await database;
    final result = await db.query(
      tableName,
      where: 'member_identification_id = ?',
      whereArgs: [identificationId],
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    return fromDatabaseJson(result.first);
  }

  /// Find members by group
  Future<List<MemberEntity>> findByGroup(String group) async {
    return await findByField('group_name', group, orderBy: 'first_name ASC, last_name ASC');
  }

  /// Find members by family
  Future<List<MemberEntity>> findByFamily(String family) async {
    return await findByField('family', family, orderBy: 'first_name ASC, last_name ASC');
  }

  /// Find members by status
  Future<List<MemberEntity>> findByStatus(String status) async {
    return await findByField('status', status, orderBy: 'first_name ASC, last_name ASC');
  }

  /// Search members by name, email, or identification ID
  Future<List<MemberEntity>> search(String query, List<String> fields, {String? orderBy}) async {
    return await super.search(query, fields, orderBy: orderBy);
  }

  /// Get unique groups
  Future<List<String>> getUniqueGroups() async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT DISTINCT group_name FROM $tableName WHERE group_name IS NOT NULL AND group_name != "" ORDER BY group_name ASC',
    );
    return result.map((row) => row['group_name'] as String).toList();
  }

  /// Get unique families
  Future<List<String>> getUniqueFamilies() async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT DISTINCT family FROM $tableName WHERE family IS NOT NULL AND family != "" ORDER BY family ASC',
    );
    return result.map((row) => row['family'] as String).toList();
  }

  /// Get member counts by status
  Future<Map<String, int>> getMemberCounts() async {
    final db = await database;
    final activeResult = await db.rawQuery(
      'SELECT COUNT(*) as count FROM $tableName WHERE status = "active"',
    );
    final inactiveResult = await db.rawQuery(
      'SELECT COUNT(*) as count FROM $tableName WHERE status = "inactive"',
    );
    final totalResult = await db.rawQuery(
      'SELECT COUNT(*) as count FROM $tableName',
    );

    return {
      'active': activeResult.first['count'] as int,
      'inactive': inactiveResult.first['count'] as int,
      'total': totalResult.first['count'] as int,
    };
  }

  /// Get members with pagination
  Future<List<MemberEntity>> getMembersPaginated({
    int page = 1,
    int perPage = 20,
    String? search,
    String? status,
    String? group,
    String? family,
  }) async {
    final offset = (page - 1) * perPage;
    final db = await database;
    
    final whereConditions = <String>[];
    final whereArgs = <dynamic>[];
    
    if (search != null && search.isNotEmpty) {
      whereConditions.add('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR member_identification_id LIKE ?)');
      whereArgs.addAll(['%$search%', '%$search%', '%$search%', '%$search%']);
    }
    
    if (status != null && status.isNotEmpty) {
      whereConditions.add('status = ?');
      whereArgs.add(status);
    }
    
    if (group != null && group.isNotEmpty) {
      whereConditions.add('group_name = ?');
      whereArgs.add(group);
    }
    
    if (family != null && family.isNotEmpty) {
      whereConditions.add('family = ?');
      whereArgs.add(family);
    }
    
    final where = whereConditions.isNotEmpty ? whereConditions.join(' AND ') : null;
    
    final result = await db.query(
      tableName,
      where: where,
      whereArgs: whereArgs.isNotEmpty ? whereArgs : null,
      orderBy: 'first_name ASC, last_name ASC',
      limit: perPage,
      offset: offset,
    );
    
    return result.map((json) => fromDatabaseJson(json)).toList();
  }
}
