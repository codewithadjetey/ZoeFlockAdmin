class OfflineAttendance {
  final int? id;
  final String localId;
  final int memberId;
  final int eventId;
  final String status;
  final DateTime checkInTime;
  final String? notes;
  final bool isFirstTimer;
  final bool isSynced;
  final int? serverId;
  final int serverVersion;
  final int localVersion;
  final bool conflictResolved;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? syncedAt;

  const OfflineAttendance({
    this.id,
    required this.localId,
    required this.memberId,
    required this.eventId,
    required this.status,
    required this.checkInTime,
    this.notes,
    this.isFirstTimer = false,
    this.isSynced = false,
    this.serverId,
    this.serverVersion = 0,
    this.localVersion = 1,
    this.conflictResolved = false,
    required this.createdAt,
    required this.updatedAt,
    this.syncedAt,
  });

  /// Create from database row
  factory OfflineAttendance.fromDatabase(Map<String, dynamic> json) {
    return OfflineAttendance(
      id: json['id'] as int?,
      localId: json['local_id'] as String,
      memberId: json['member_id'] as int,
      eventId: json['event_id'] as int,
      status: json['status'] as String,
      checkInTime: DateTime.fromMillisecondsSinceEpoch(json['check_in_time'] as int),
      notes: json['notes'] as String?,
      isFirstTimer: (json['is_first_timer'] as int? ?? 0) == 1,
      isSynced: (json['is_synced'] as int? ?? 0) == 1,
      serverId: json['server_id'] as int?,
      serverVersion: json['server_version'] as int? ?? 0,
      localVersion: json['local_version'] as int? ?? 1,
      conflictResolved: (json['conflict_resolved'] as int? ?? 0) == 1,
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at'] as int),
      syncedAt: json['synced_at'] != null 
          ? DateTime.fromMillisecondsSinceEpoch(json['synced_at'] as int)
          : null,
    );
  }

  /// Convert to database row
  Map<String, dynamic> toDatabaseJson() {
    return {
      if (id != null) 'id': id,
      'local_id': localId,
      'member_id': memberId,
      'event_id': eventId,
      'status': status,
      'check_in_time': checkInTime.millisecondsSinceEpoch,
      'notes': notes,
      'is_first_timer': isFirstTimer ? 1 : 0,
      'is_synced': isSynced ? 1 : 0,
      'server_id': serverId,
      'server_version': serverVersion,
      'local_version': localVersion,
      'conflict_resolved': conflictResolved ? 1 : 0,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
      'synced_at': syncedAt?.millisecondsSinceEpoch,
    };
  }

  /// Convert to API format for sync
  Map<String, dynamic> toApiJson() {
    return {
      if (serverId != null) 'id': serverId,
      'member_id': memberId,
      'event_id': eventId,
      'status': status,
      'check_in_time': checkInTime.toIso8601String(),
      'notes': notes,
      'is_first_timer': isFirstTimer,
      'version': localVersion,
    };
  }

  /// Create from API response
  factory OfflineAttendance.fromApiJson(Map<String, dynamic> json, String localId) {
    return OfflineAttendance(
      localId: localId,
      memberId: json['member_id'] as int,
      eventId: json['event_id'] as int,
      status: json['status'] as String,
      checkInTime: DateTime.parse(json['check_in_time'] as String),
      notes: json['notes'] as String?,
      isFirstTimer: json['is_first_timer'] as bool? ?? false,
      isSynced: true,
      serverId: json['id'] as int?,
      serverVersion: json['version'] as int? ?? 1,
      localVersion: json['version'] as int? ?? 1,
      conflictResolved: true,
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null 
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
      syncedAt: DateTime.now(),
    );
  }

  /// Create a copy with updated fields
  OfflineAttendance copyWith({
    int? id,
    String? localId,
    int? memberId,
    int? eventId,
    String? status,
    DateTime? checkInTime,
    String? notes,
    bool? isFirstTimer,
    bool? isSynced,
    int? serverId,
    int? serverVersion,
    int? localVersion,
    bool? conflictResolved,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? syncedAt,
  }) {
    return OfflineAttendance(
      id: id ?? this.id,
      localId: localId ?? this.localId,
      memberId: memberId ?? this.memberId,
      eventId: eventId ?? this.eventId,
      status: status ?? this.status,
      checkInTime: checkInTime ?? this.checkInTime,
      notes: notes ?? this.notes,
      isFirstTimer: isFirstTimer ?? this.isFirstTimer,
      isSynced: isSynced ?? this.isSynced,
      serverId: serverId ?? this.serverId,
      serverVersion: serverVersion ?? this.serverVersion,
      localVersion: localVersion ?? this.localVersion,
      conflictResolved: conflictResolved ?? this.conflictResolved,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      syncedAt: syncedAt ?? this.syncedAt,
    );
  }

  /// Check if this attendance has a conflict with server data
  bool hasConflict(OfflineAttendance serverAttendance) {
    return serverId != null && 
           serverId == serverAttendance.serverId &&
           localVersion != serverAttendance.serverVersion;
  }

  /// Get conflict resolution strategy
  ConflictResolution getConflictResolution(OfflineAttendance serverAttendance) {
    if (!hasConflict(serverAttendance)) {
      return ConflictResolution.noConflict;
    }

    // If local version is higher, keep local
    if (localVersion > serverAttendance.serverVersion) {
      return ConflictResolution.keepLocal;
    }

    // If server version is higher, use server
    if (serverAttendance.serverVersion > localVersion) {
      return ConflictResolution.useServer;
    }

    // If versions are equal, use most recent update
    if (updatedAt.isAfter(serverAttendance.updatedAt)) {
      return ConflictResolution.keepLocal;
    } else {
      return ConflictResolution.useServer;
    }
  }

  @override
  String toString() {
    return 'OfflineAttendance(id: $id, localId: $localId, memberId: $memberId, eventId: $eventId, status: $status, isSynced: $isSynced, serverId: $serverId, localVersion: $localVersion, serverVersion: $serverVersion)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is OfflineAttendance &&
        other.localId == localId &&
        other.memberId == memberId &&
        other.eventId == eventId;
  }

  @override
  int get hashCode {
    return localId.hashCode ^ memberId.hashCode ^ eventId.hashCode;
  }
}

enum ConflictResolution {
  noConflict,
  keepLocal,
  useServer,
  manualResolution,
}
