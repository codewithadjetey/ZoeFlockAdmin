class Attendance {
  final int id;
  final int memberId;
  final int eventId;
  final String status;
  final DateTime checkInTime;
  final String? notes;
  final bool isFirstTimer;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Attendance({
    required this.id,
    required this.memberId,
    required this.eventId,
    required this.status,
    required this.checkInTime,
    this.notes,
    this.isFirstTimer = false,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isPresent => status.toLowerCase() == 'present';
  bool get isAbsent => status.toLowerCase() == 'absent';
  bool get isLate => status.toLowerCase() == 'late';

  String get formattedCheckInTime {
    final hour = checkInTime.hour.toString().padLeft(2, '0');
    final minute = checkInTime.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  factory Attendance.fromJson(Map<String, dynamic> json) {
    return Attendance(
      id: json['id'] as int,
      memberId: json['member_id'] as int,
      eventId: json['event_id'] as int,
      status: json['status'] as String,
      checkInTime: DateTime.parse(json['check_in_time'] as String),
      notes: json['notes'] as String?,
      isFirstTimer: json['is_first_timer'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'member_id': memberId,
      'event_id': eventId,
      'status': status,
      'check_in_time': checkInTime.toIso8601String(),
      'notes': notes,
      'is_first_timer': isFirstTimer,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Map<String, dynamic> toDatabaseJson() {
    return {
      'id': id,
      'member_id': memberId,
      'event_id': eventId,
      'status': status,
      'check_in_time': checkInTime.millisecondsSinceEpoch,
      'notes': notes ?? '',
      'is_first_timer': isFirstTimer ? 1 : 0,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  factory Attendance.fromDatabase(Map<String, dynamic> json) {
    return Attendance(
      id: json['id'] as int,
      memberId: json['member_id'] as int,
      eventId: json['event_id'] as int,
      status: json['status'] as String,
      checkInTime: DateTime.fromMillisecondsSinceEpoch(json['check_in_time'] as int),
      notes: json['notes'] as String?,
      isFirstTimer: (json['is_first_timer'] as int) == 1,
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at'] as int),
    );
  }

  Attendance copyWith({
    int? id,
    int? memberId,
    int? eventId,
    String? status,
    DateTime? checkInTime,
    String? notes,
    bool? isFirstTimer,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Attendance(
      id: id ?? this.id,
      memberId: memberId ?? this.memberId,
      eventId: eventId ?? this.eventId,
      status: status ?? this.status,
      checkInTime: checkInTime ?? this.checkInTime,
      notes: notes ?? this.notes,
      isFirstTimer: isFirstTimer ?? this.isFirstTimer,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Attendance && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'Attendance(id: $id, memberId: $memberId, eventId: $eventId, status: $status, time: $checkInTime)';
  }
}
