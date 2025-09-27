import '../base_entity.dart';
import '../repository.dart';
import '../../utils/constants.dart';

/// User entity that extends BaseEntity for ORM functionality
class UserEntity extends BaseEntity {
  @override
  String get tableName => 'users';

  final int? _id;
  final String username;
  final String email;
  final String? passwordHash;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String? profileImagePath;
  final String role;
  final bool isActive;
  final DateTime? lastLoginAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  @override
  int? get id => _id;

  const UserEntity({
    int? id,
    required this.username,
    required this.email,
    this.passwordHash,
    this.firstName,
    this.lastName,
    this.phone,
    this.profileImagePath,
    required this.role,
    this.isActive = true,
    this.lastLoginAt,
    required this.createdAt,
    required this.updatedAt,
  }) : _id = id;

  String get fullName {
    if (firstName != null && lastName != null) {
      return '$firstName $lastName';
    } else if (firstName != null) {
      return firstName!;
    } else if (lastName != null) {
      return lastName!;
    } else {
      return username;
    }
  }

  String get initials {
    if (firstName != null && lastName != null) {
      return '${firstName![0].toUpperCase()}${lastName![0].toUpperCase()}';
    } else if (firstName != null) {
      return firstName![0].toUpperCase();
    } else if (lastName != null) {
      return lastName![0].toUpperCase();
    } else {
      return username[0].toUpperCase();
    }
  }

  bool get isAdmin => role.toLowerCase() == 'admin';
  bool get isModerator => role.toLowerCase() == 'moderator';
  bool get isUser => role.toLowerCase() == 'user';

  @override
  Map<String, dynamic> toDatabaseJson() {
    return {
      if (_id != null) 'id': _id,
      'username': username,
      'email': email,
      'password_hash': passwordHash,
      'first_name': firstName,
      'last_name': lastName,
      'phone': phone,
      'profile_image_path': profileImagePath,
      'role': role,
      'is_active': isActive ? 1 : 0,
      'last_login_at': lastLoginAt?.millisecondsSinceEpoch,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  @override
  void _updateFromDatabase(Map<String, dynamic> json) {
    // This method would update the current instance
    // Since we're using immutable entities, we'll create a new instance
  }

  static UserEntity fromDatabase(Map<String, dynamic> json) {
    return UserEntity(
      id: json['id'] as int?,
      username: json['username'] as String? ?? '',
      email: json['email'] as String? ?? '',
      passwordHash: json['password_hash'] as String?,
      firstName: json['first_name'] as String?,
      lastName: json['last_name'] as String?,
      phone: json['phone'] as String?,
      profileImagePath: json['profile_image_path'] as String?,
      role: json['role'] as String? ?? 'user',
      isActive: (json['is_active'] as int? ?? 1) == 1,
      lastLoginAt: json['last_login_at'] != null
          ? DateTime.fromMillisecondsSinceEpoch(json['last_login_at'] as int)
          : null,
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at'] as int),
    );
  }

  factory UserEntity.fromJson(Map<String, dynamic> json) {
    return UserEntity(
      id: json['id'] as int?,
      username: json['username'] as String? ?? '',
      email: json['email'] as String? ?? '',
      passwordHash: json['password_hash'] as String?,
      firstName: json['first_name'] as String?,
      lastName: json['last_name'] as String?,
      phone: json['phone'] as String?,
      profileImagePath: json['profile_image_path'] as String?,
      role: json['role'] as String? ?? 'user',
      isActive: json['is_active'] as bool? ?? true,
      lastLoginAt: json['last_login_at'] != null
          ? DateTime.parse(json['last_login_at'] as String)
          : null,
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
      'username': username,
      'email': email,
      'password_hash': passwordHash,
      'first_name': firstName,
      'last_name': lastName,
      'phone': phone,
      'profile_image_path': profileImagePath,
      'role': role,
      'is_active': isActive,
      'last_login_at': lastLoginAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  UserEntity copyWith({
    int? id,
    String? username,
    String? email,
    String? passwordHash,
    String? firstName,
    String? lastName,
    String? phone,
    String? profileImagePath,
    String? role,
    bool? isActive,
    DateTime? lastLoginAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserEntity(
      id: id ?? _id,
      username: username ?? this.username,
      email: email ?? this.email,
      passwordHash: passwordHash ?? this.passwordHash,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      phone: phone ?? this.phone,
      profileImagePath: profileImagePath ?? this.profileImagePath,
      role: role ?? this.role,
      isActive: isActive ?? this.isActive,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserEntity && other._id == _id;
  }

  @override
  int get hashCode => _id.hashCode;

  @override
  String toString() {
    return 'UserEntity(id: $_id, username: $username, email: $email, role: $role)';
  }
}

/// User repository for database operations
class UserRepository extends BaseRepository<UserEntity> {
  @override
  String get tableName => 'users';

  @override
  UserEntity fromDatabaseJson(Map<String, dynamic> json) {
    return UserEntity.fromDatabase(json);
  }

  /// Find user by username
  Future<UserEntity?> findByUsername(String username) async {
    final db = await database;
    final result = await db.query(
      tableName,
      where: 'username = ?',
      whereArgs: [username],
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    return fromDatabaseJson(result.first);
  }

  /// Find user by email
  Future<UserEntity?> findByEmail(String email) async {
    final db = await database;
    final result = await db.query(
      tableName,
      where: 'email = ?',
      whereArgs: [email],
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    return fromDatabaseJson(result.first);
  }

  /// Find users by role
  Future<List<UserEntity>> findByRole(String role) async {
    return await findByField('role', role, orderBy: 'username ASC');
  }

  /// Find active users
  Future<List<UserEntity>> findActiveUsers() async {
    return await findByField('is_active', 1, orderBy: 'username ASC');
  }

  /// Find inactive users
  Future<List<UserEntity>> findInactiveUsers() async {
    return await findByField('is_active', 0, orderBy: 'username ASC');
  }

  /// Search users by username, email, or name
  Future<List<UserEntity>> search(String query) async {
    return await search(query, ['username', 'email', 'first_name', 'last_name']);
  }

  /// Update last login time
  Future<int> updateLastLogin(int userId) async {
    final db = await database;
    return await db.update(
      tableName,
      {
        'last_login_at': DateTime.now().millisecondsSinceEpoch,
        'updated_at': DateTime.now().millisecondsSinceEpoch,
      },
      where: 'id = ?',
      whereArgs: [userId],
    );
  }

  /// Get user statistics
  Future<Map<String, int>> getUserStatistics() async {
    final db = await database;
    
    final totalResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName');
    final activeResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE is_active = 1');
    final adminResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE role = "admin"');
    final moderatorResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE role = "moderator"');
    
    return {
      'total': totalResult.first['count'] as int,
      'active': activeResult.first['count'] as int,
      'admins': adminResult.first['count'] as int,
      'moderators': moderatorResult.first['count'] as int,
    };
  }

  /// Get users with pagination
  Future<List<UserEntity>> getUsersPaginated({
    int page = 1,
    int perPage = 20,
    String? search,
    String? role,
    bool? isActive,
  }) async {
    final offset = (page - 1) * perPage;
    final db = await database;
    
    final whereConditions = <String>[];
    final whereArgs = <dynamic>[];
    
    if (search != null && search.isNotEmpty) {
      whereConditions.add('(username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)');
      whereArgs.addAll(['%$search%', '%$search%', '%$search%', '%$search%']);
    }
    
    if (role != null && role.isNotEmpty) {
      whereConditions.add('role = ?');
      whereArgs.add(role);
    }
    
    if (isActive != null) {
      whereConditions.add('is_active = ?');
      whereArgs.add(isActive ? 1 : 0);
    }
    
    final where = whereConditions.isNotEmpty ? whereConditions.join(' AND ') : null;
    
    final result = await db.query(
      tableName,
      where: where,
      whereArgs: whereArgs.isNotEmpty ? whereArgs : null,
      orderBy: 'username ASC',
      limit: perPage,
      offset: offset,
    );
    
    return result.map((json) => fromDatabaseJson(json)).toList();
  }
}
