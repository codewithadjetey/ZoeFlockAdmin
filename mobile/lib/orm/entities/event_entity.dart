import '../base_entity.dart';
import '../base_repository.dart';
import '../../utils/constants.dart';

/// Event entity that extends BaseEntity for ORM functionality
class EventEntity extends BaseEntity {
  @override
  String get tableName => DatabaseConstants.eventsTable;

  final int? _id;
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

  @override
  int? get id => _id;

  EventEntity({
    int? id,
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
  }) : _id = id;

  bool get isActive => status.toLowerCase() == 'active';
  bool get isUpcoming => startDate.isAfter(DateTime.now());
  bool get isPast => endDate != null ? endDate!.isBefore(DateTime.now()) : startDate.isBefore(DateTime.now());
  
  bool get isToday {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final eventDate = DateTime(startDate.year, startDate.month, startDate.day);
    return today == eventDate;
  }
  
  bool get isEligibleForAttendance {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final eventDate = DateTime(startDate.year, startDate.month, startDate.day);
    
    // Event is eligible if it's today or in the past
    return eventDate.isBefore(today) || eventDate.isAtSameMomentAs(today);
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
    } else if (difference > 0) {
      return 'In $difference days';
    } else {
      return '${-difference} days ago';
    }
  }

  @override
  Map<String, dynamic> toDatabaseJson() {
    return {
      if (_id != null) 'id': _id,
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

  @override
  void _updateFromDatabase(Map<String, dynamic> json) {
    // This method would update the current instance
    // Since we're using immutable entities, we'll create a new instance
  }

  static EventEntity fromDatabase(Map<String, dynamic> json) {
    return EventEntity(
      id: json['id'] as int?,
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      startDate: DateTime.fromMillisecondsSinceEpoch(json['start_date'] as int),
      endDate: json['end_date'] != null
          ? DateTime.fromMillisecondsSinceEpoch(json['end_date'] as int)
          : null,
      location: json['location'] as String?,
      time: json['time'] as String?,
      status: json['status'] as String? ?? 'inactive',
      attendanceCount: json['attendance_count'] as int?,
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at'] as int),
    );
  }

  factory EventEntity.fromJson(Map<String, dynamic> json) {
    return EventEntity(
      id: json['id'] as int?,
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      startDate: json['start_date'] != null
          ? DateTime.parse(json['start_date'] as String)
          : DateTime.now(),
      endDate: json['end_date'] != null
          ? DateTime.parse(json['end_date'] as String)
          : null,
      location: json['location'] as String?,
      time: json['time'] as String?,
      status: json['status'] as String? ?? 'inactive',
      attendanceCount: json['attendance_count'] as int?,
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

  EventEntity copyWith({
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
    return EventEntity(
      id: id ?? _id,
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
    return other is EventEntity && other._id == _id;
  }

  @override
  int get hashCode => _id.hashCode;

  @override
  String toString() {
    return 'EventEntity(id: $_id, title: $title, startDate: $startDate, status: $status)';
  }
}

/// Event repository for database operations
class EventRepository extends BaseRepository<EventEntity> {
  @override
  String get tableName => DatabaseConstants.eventsTable;

  @override
  EventEntity fromDatabaseJson(Map<String, dynamic> json) {
    return EventEntity.fromDatabase(json);
  }

  /// Find active events
  Future<List<EventEntity>> findActiveEvents() async {
    return await findByField('status', 'active', orderBy: 'start_date DESC');
  }

  /// Find events by status
  Future<List<EventEntity>> findByStatus(String status) async {
    return await findByField('status', status, orderBy: 'start_date DESC');
  }

  /// Find events for today
  Future<List<EventEntity>> findTodayEvents() async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = today.add(const Duration(days: 1));
    
    return await findWhere(
      'start_date >= ? AND start_date < ?',
      [today.millisecondsSinceEpoch, tomorrow.millisecondsSinceEpoch],
      orderBy: 'start_date ASC',
    );
  }

  /// Find upcoming events
  Future<List<EventEntity>> findUpcomingEvents() async {
    final now = DateTime.now();
    return await findWhere(
      'start_date > ?',
      [now.millisecondsSinceEpoch],
      orderBy: 'start_date ASC',
    );
  }

  /// Find past events
  Future<List<EventEntity>> findPastEvents() async {
    final now = DateTime.now();
    return await findWhere(
      'start_date < ?',
      [now.millisecondsSinceEpoch],
      orderBy: 'start_date DESC',
    );
  }

  /// Find events eligible for attendance
  Future<List<EventEntity>> findEligibleForAttendance() async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    
    return await findWhere(
      'start_date <= ? AND status = ?',
      [today.millisecondsSinceEpoch, 'active'],
      orderBy: 'start_date DESC',
    );
  }

  /// Find events by date range
  Future<List<EventEntity>> findByDateRange(DateTime start, DateTime end) async {
    return await findWhere(
      'start_date >= ? AND start_date <= ?',
      [start.millisecondsSinceEpoch, end.millisecondsSinceEpoch],
      orderBy: 'start_date ASC',
    );
  }

  /// Search events by title, description, or location
  Future<List<EventEntity>> search(String query, List<String> fields, {String? orderBy}) async {
    return await super.search(query, fields, orderBy: orderBy);
  }

  /// Get events with pagination
  Future<List<EventEntity>> getEventsPaginated({
    int page = 1,
    int perPage = 20,
    String? search,
    String? status,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    final offset = (page - 1) * perPage;
    final db = await database;
    
    final whereConditions = <String>[];
    final whereArgs = <dynamic>[];
    
    if (search != null && search.isNotEmpty) {
      whereConditions.add('(title LIKE ? OR description LIKE ? OR location LIKE ?)');
      whereArgs.addAll(['%$search%', '%$search%', '%$search%']);
    }
    
    if (status != null && status.isNotEmpty) {
      whereConditions.add('status = ?');
      whereArgs.add(status);
    }
    
    if (startDate != null) {
      whereConditions.add('start_date >= ?');
      whereArgs.add(startDate.millisecondsSinceEpoch);
    }
    
    if (endDate != null) {
      whereConditions.add('start_date <= ?');
      whereArgs.add(endDate.millisecondsSinceEpoch);
    }
    
    final where = whereConditions.isNotEmpty ? whereConditions.join(' AND ') : null;
    
    final result = await db.query(
      tableName,
      where: where,
      whereArgs: whereArgs.isNotEmpty ? whereArgs : null,
      orderBy: 'start_date DESC',
      limit: perPage,
      offset: offset,
    );
    
    return result.map((json) => fromDatabaseJson(json)).toList();
  }

  /// Update attendance count for an event
  Future<int> updateAttendanceCount(int eventId, int count) async {
    final db = await database;
    return await db.update(
      tableName,
      {
        'attendance_count': count,
        'updated_at': DateTime.now().millisecondsSinceEpoch,
      },
      where: 'id = ?',
      whereArgs: [eventId],
    );
  }

  /// Get event statistics
  Future<Map<String, int>> getEventStatistics() async {
    final db = await database;
    
    final totalResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName');
    final activeResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE status = "active"');
    final upcomingResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE start_date > ?', [DateTime.now().millisecondsSinceEpoch]);
    final pastResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE start_date < ?', [DateTime.now().millisecondsSinceEpoch]);
    
    return {
      'total': totalResult.first['count'] as int,
      'active': activeResult.first['count'] as int,
      'upcoming': upcomingResult.first['count'] as int,
      'past': pastResult.first['count'] as int,
    };
  }
}
