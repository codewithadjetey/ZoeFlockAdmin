class Member {
  final int id;
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

  const Member({
    required this.id,
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
  });

  String get fullName => '$firstName $lastName';
  
  String get initials {
    final firstInitial = firstName.isNotEmpty ? firstName[0].toUpperCase() : '';
    final lastInitial = lastName.isNotEmpty ? lastName[0].toUpperCase() : '';
    return '$firstInitial$lastInitial';
  }

  bool get isActive => status.toLowerCase() == 'active';

  factory Member.fromJson(Map<String, dynamic> json) {
    return Member(
      id: json['id'] as int,
      firstName: json['first_name'] as String,
      lastName: json['last_name'] as String,
      email: json['email'] as String,
      profileImagePath: json['profile_image_path'] as String?,
      memberIdentificationId: json['member_identification_id'] as String,
      group: json['group'] as String?,
      family: json['family'] as String?,
      gender: json['gender'] as String?,
      phone: json['phone'] as String?,
      dateOfBirth: json['date_of_birth'] != null 
          ? DateTime.parse(json['date_of_birth'] as String)
          : null,
      status: json['status'] as String,
      lastAttendanceDate: json['last_attendance_date'] != null
          ? DateTime.parse(json['last_attendance_date'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
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

  Map<String, dynamic> toDatabaseJson() {
    return {
      'id': id,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'profile_image_path': profileImagePath ?? '',
      'member_identification_id': memberIdentificationId,
      'group': group ?? '',
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

  factory Member.fromDatabase(Map<String, dynamic> json) {
    return Member(
      id: json['id'] as int,
      firstName: json['first_name'] as String,
      lastName: json['last_name'] as String,
      email: json['email'] as String,
      profileImagePath: json['profile_image_path'] as String?,
      memberIdentificationId: json['member_identification_id'] as String,
      group: json['group'] as String?,
      family: json['family'] as String?,
      gender: json['gender'] as String?,
      phone: json['phone'] as String?,
      dateOfBirth: json['date_of_birth'] != null
          ? DateTime.fromMillisecondsSinceEpoch(json['date_of_birth'] as int)
          : null,
      status: json['status'] as String,
      lastAttendanceDate: json['last_attendance_date'] != null
          ? DateTime.fromMillisecondsSinceEpoch(json['last_attendance_date'] as int)
          : null,
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at'] as int),
    );
  }

  Member copyWith({
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
    return Member(
      id: id ?? this.id,
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
    return other is Member && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'Member(id: $id, name: $fullName, email: $email, memberId: $memberIdentificationId)';
  }
}
