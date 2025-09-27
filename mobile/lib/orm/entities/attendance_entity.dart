import '../base_entity.dart';
import '../base_repository.dart';
import '../../utils/constants.dart';

/// Attendance entity that extends BaseEntity for ORM functionality
class AttendanceEntity extends BaseEntity {
  @override
  String get tableName => DatabaseConstants.attendanceTable;

  final int? _id;
  final int memberId;
  final int eventId;
  final String status;
  final DateTime checkInTime;
  final String? notes;
  final bool isFirstTimer;
  final int? version;
  final DateTime createdAt;
  final DateTime updatedAt;

  @override
  int? get id => _id;

  AttendanceEntity({
    int? id,
    required this.memberId,
    required this.eventId,
    required this.status,
    required this.checkInTime,
    this.notes,
    this.isFirstTimer = false,
    this.version,
    required this.createdAt,
    required this.updatedAt,
  }) : _id = id;

  bool get isPresent => status.toLowerCase() == 'present';
  bool get isAbsent => status.toLowerCase() == 'absent';
  bool get isLate => status.toLowerCase() == 'late';

  String get formattedCheckInTime {
    final hour = checkInTime.hour.toString().padLeft(2, '0');
    final minute = checkInTime.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  @override
  Map<String, dynamic> toDatabaseJson() {
    return {
      if (_id != null) 'id': _id,
      'member_id': memberId,
      'event_id': eventId,
      'status': status,
      'check_in_time': checkInTime.millisecondsSinceEpoch,
      'notes': notes ?? '',
      'is_first_timer': isFirstTimer ? 1 : 0,
      'version': version ?? 1,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  @override
  void _updateFromDatabase(Map<String, dynamic> json) {
    // This method would update the current instance
    // Since we're using immutable entities, we'll create a new instance
  }

  static AttendanceEntity fromDatabase(Map<String, dynamic> json) {
    return AttendanceEntity(
      id: json['id'] as int?,
      memberId: json['member_id'] as int,
      eventId: json['event_id'] as int,
      status: json['status'] as String? ?? 'present',
      checkInTime: DateTime.fromMillisecondsSinceEpoch(json['check_in_time'] as int),
      notes: json['notes'] as String?,
      isFirstTimer: (json['is_first_timer'] as int? ?? 0) == 1,
      version: json['version'] as int?,
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at'] as int),
    );
  }

  factory AttendanceEntity.fromJson(Map<String, dynamic> json) {
    return AttendanceEntity(
      id: json['id'] as int?,
      memberId: json['member_id'] as int,
      eventId: json['event_id'] as int,
      status: json['status'] as String? ?? 'present',
      checkInTime: DateTime.parse(json['check_in_time'] as String? ?? ''),
      notes: json['notes'] as String?,
      isFirstTimer: json['is_first_timer'] as bool? ?? false,
      version: json['version'] as int?,
      createdAt: DateTime.parse(json['created_at'] as String? ?? ''),
      updatedAt: DateTime.parse(json['updated_at'] as String? ?? ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (_id != null) 'id': _id,
      'member_id': memberId,
      'event_id': eventId,
      'status': status,
      'check_in_time': checkInTime.toIso8601String(),
      'notes': notes,
      'is_first_timer': isFirstTimer,
      'version': version,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  AttendanceEntity copyWith({
    int? id,
    int? memberId,
    int? eventId,
    String? status,
    DateTime? checkInTime,
    String? notes,
    bool? isFirstTimer,
    int? version,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return AttendanceEntity(
      id: id ?? _id,
      memberId: memberId ?? this.memberId,
      eventId: eventId ?? this.eventId,
      status: status ?? this.status,
      checkInTime: checkInTime ?? this.checkInTime,
      notes: notes ?? this.notes,
      isFirstTimer: isFirstTimer ?? this.isFirstTimer,
      version: version ?? this.version,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AttendanceEntity && other._id == _id;
  }

  @override
  int get hashCode => _id.hashCode;

  @override
  String toString() {
    return 'AttendanceEntity(id: $_id, memberId: $memberId, eventId: $eventId, status: $status, checkInTime: $checkInTime)';
  }
}

/// Attendance repository for database operations
class AttendanceRepository extends BaseRepository<AttendanceEntity> {
  @override
  String get tableName => DatabaseConstants.attendanceTable;

  @override
  AttendanceEntity fromDatabaseJson(Map<String, dynamic> json) {
    return AttendanceEntity.fromDatabase(json);
  }

  /// Find attendance by member and event
  Future<AttendanceEntity?> findByMemberAndEvent(int memberId, int eventId) async {
    final db = await database;
    final result = await db.query(
      tableName,
      where: 'member_id = ? AND event_id = ?',
      whereArgs: [memberId, eventId],
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    return fromDatabaseJson(result.first);
  }

  /// Find attendance by event
  Future<List<AttendanceEntity>> findByEvent(int eventId) async {
    return await findWhere(
      'event_id = ?',
      [eventId],
      orderBy: 'check_in_time DESC',
    );
  }

  /// Find attendance by member
  Future<List<AttendanceEntity>> findByMember(int memberId) async {
    return await findWhere(
      'member_id = ?',
      [memberId],
      orderBy: 'check_in_time DESC',
    );
  }

  /// Find attendance by status
  Future<List<AttendanceEntity>> findByStatus(String status) async {
    return await findByField('status', status, orderBy: 'check_in_time DESC');
  }

  /// Find first timer attendance
  Future<List<AttendanceEntity>> findFirstTimers() async {
    return await findWhere(
      'is_first_timer = ?',
      [1],
      orderBy: 'check_in_time DESC',
    );
  }

  /// Get attendance count for an event
  Future<int> getAttendanceCountForEvent(int eventId) async {
    return await countWhere('event_id = ?', [eventId]);
  }

  /// Get attendance count by status for an event
  Future<Map<String, int>> getAttendanceCountByStatusForEvent(int eventId) async {
    final db = await database;
    
    final presentResult = await db.rawQuery(
      'SELECT COUNT(*) as count FROM $tableName WHERE event_id = ? AND status = "present"',
      [eventId],
    );
    final absentResult = await db.rawQuery(
      'SELECT COUNT(*) as count FROM $tableName WHERE event_id = ? AND status = "absent"',
      [eventId],
    );
    final lateResult = await db.rawQuery(
      'SELECT COUNT(*) as count FROM $tableName WHERE event_id = ? AND status = "late"',
      [eventId],
    );
    
    return {
      'present': presentResult.first['count'] as int,
      'absent': absentResult.first['count'] as int,
      'late': lateResult.first['count'] as int,
    };
  }

  /// Get attendance statistics
  Future<Map<String, int>> getAttendanceStatistics() async {
    final db = await database;
    
    final totalResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName');
    final presentResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE status = "present"');
    final absentResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE status = "absent"');
    final lateResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE status = "late"');
    final firstTimersResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE is_first_timer = 1');
    
    return {
      'total': totalResult.first['count'] as int,
      'present': presentResult.first['count'] as int,
      'absent': absentResult.first['count'] as int,
      'late': lateResult.first['count'] as int,
      'first_timers': firstTimersResult.first['count'] as int,
    };
  }

  /// Get attendance for date range
  Future<List<AttendanceEntity>> findByDateRange(DateTime start, DateTime end) async {
    return await findWhere(
      'check_in_time >= ? AND check_in_time <= ?',
      [start.millisecondsSinceEpoch, end.millisecondsSinceEpoch],
      orderBy: 'check_in_time DESC',
    );
  }

  /// Get recent attendance
  Future<List<AttendanceEntity>> getRecentAttendance({int limit = 10}) async {
    final db = await database;
    final result = await db.query(
      tableName,
      orderBy: 'check_in_time DESC',
      limit: limit,
    );
    
    return result.map((json) => fromDatabaseJson(json)).toList();
  }

  /// Check if member attended event
  Future<bool> hasMemberAttendedEvent(int memberId, int eventId) async {
    final attendance = await findByMemberAndEvent(memberId, eventId);
    return attendance != null && attendance.isPresent;
  }

  /// Get member attendance history
  Future<List<AttendanceEntity>> getMemberAttendanceHistory(int memberId, {int limit = 20}) async {
    return await findWhere(
      'member_id = ?',
      [memberId],
      orderBy: 'check_in_time DESC',
    );
  }
}
