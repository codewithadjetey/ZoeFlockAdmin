class Event {
  final int id;
  final String title;
  final String? description;
  final DateTime startDate;
  final DateTime? endDate;
  final String? location;
  final String? time;
  final String status;
  final int? attendanceCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Event({
    required this.id,
    required this.title,
    this.description,
    required this.startDate,
    this.endDate,
    this.location,
    this.time,
    required this.status,
    this.attendanceCount,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isActive => status.toLowerCase() == 'active';
  bool get isUpcoming => startDate.isAfter(DateTime.now());
  bool get isPast => endDate != null ? endDate!.isBefore(DateTime.now()) : startDate.isBefore(DateTime.now());
  bool get isToday {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final eventDate = DateTime(startDate.year, startDate.month, startDate.day);
    return today == eventDate;
  }

  String get formattedDate {
    final now = DateTime.now();
    final difference = startDate.difference(now).inDays;
    
    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Tomorrow';
    } else if (difference == -1) {
      return 'Yesterday';
    } else if (difference > 0 && difference <= 7) {
      return 'In $difference days';
    } else {
      return '${startDate.day}/${startDate.month}/${startDate.year}';
    }
  }

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String?,
      startDate: DateTime.parse(json['start_date'] as String),
      endDate: json['end_date'] != null 
          ? DateTime.parse(json['end_date'] as String)
          : null,
      location: json['location'] as String?,
      time: json['time'] as String?,
      status: json['status'] as String,
      attendanceCount: json['attendance_count'] as int?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'start_date': startDate.toIso8601String(),
      'end_date': endDate?.toIso8601String(),
      'location': location,
      'time': time,
      'status': status,
      'attendance_count': attendanceCount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Map<String, dynamic> toDatabaseJson() {
    return {
      'id': id,
      'title': title,
      'description': description ?? '',
      'start_date': startDate.millisecondsSinceEpoch,
      'end_date': endDate?.millisecondsSinceEpoch,
      'location': location ?? '',
      'time': time ?? '',
      'status': status,
      'attendance_count': attendanceCount ?? 0,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  factory Event.fromDatabase(Map<String, dynamic> json) {
    return Event(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String?,
      startDate: DateTime.fromMillisecondsSinceEpoch(json['start_date'] as int),
      endDate: json['end_date'] != null
          ? DateTime.fromMillisecondsSinceEpoch(json['end_date'] as int)
          : null,
      location: json['location'] as String?,
      time: json['time'] as String?,
      status: json['status'] as String,
      attendanceCount: json['attendance_count'] as int?,
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at'] as int),
    );
  }

  Event copyWith({
    int? id,
    String? title,
    String? description,
    DateTime? startDate,
    DateTime? endDate,
    String? location,
    String? time,
    String? status,
    int? attendanceCount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Event(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      location: location ?? this.location,
      time: time ?? this.time,
      status: status ?? this.status,
      attendanceCount: attendanceCount ?? this.attendanceCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Event && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'Event(id: $id, title: $title, date: $startDate, status: $status)';
  }
}
