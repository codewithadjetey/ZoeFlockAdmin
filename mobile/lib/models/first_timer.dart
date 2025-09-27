class FirstTimer {
  final int id;
  final String name;
  final String? location;
  final String primaryMobileNumber;
  final String? secondaryMobileNumber;
  final String? howWasService;
  final bool isFirstTime;
  final bool? hasPermanentPlaceOfWorship;
  final String? invitedBy;
  final int? invitedByMemberId;
  final bool? wouldLikeToStay;
  final int visitCount;
  final FirstTimerStatus status;
  final bool selfRegistered;
  final int? assignedMemberId;
  final String? deviceFingerprint;
  final DateTime? lastSubmissionDate;
  final int eventId;
  final bool isPushedToServer;
  final DateTime? pushedAt;
  final String? pushError;
  final int pushAttempts;
  final DateTime? lastPushAttempt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const FirstTimer({
    required this.id,
    required this.name,
    this.location,
    required this.primaryMobileNumber,
    this.secondaryMobileNumber,
    this.howWasService,
    this.isFirstTime = true,
    this.hasPermanentPlaceOfWorship,
    this.invitedBy,
    this.invitedByMemberId,
    this.wouldLikeToStay,
    this.visitCount = 1,
    required this.status,
    this.selfRegistered = false,
    this.assignedMemberId,
    this.deviceFingerprint,
    this.lastSubmissionDate,
    required this.eventId,
    this.isPushedToServer = false,
    this.pushedAt,
    this.pushError,
    this.pushAttempts = 0,
    this.lastPushAttempt,
    required this.createdAt,
    required this.updatedAt,
  });

  String get fullName => name;
  
  String get displayName => name;
  
  String get phoneNumber => primaryMobileNumber;
  
  String get secondaryPhone => secondaryMobileNumber ?? '';
  
  bool get hasSecondaryPhone => secondaryMobileNumber != null && secondaryMobileNumber!.isNotEmpty;
  
  bool get isVisitor => status == FirstTimerStatus.visitor;
  
  bool get isPotentialMember => status == FirstTimerStatus.potentialMember;
  
  bool get isFirstTimerStatus => status == FirstTimerStatus.firstTimer;
  
  String get statusDisplayName {
    switch (status) {
      case FirstTimerStatus.firstTimer:
        return 'First Timer';
      case FirstTimerStatus.visitor:
        return 'Visitor';
      case FirstTimerStatus.potentialMember:
        return 'Potential Member';
    }
  }
  
  String get visitCountDisplay => '$visitCount visit${visitCount != 1 ? 's' : ''}';
  
  bool get hasPushError => pushError != null && pushError!.isNotEmpty;
  
  String get pushStatus {
    if (isPushedToServer) {
      return 'Synced';
    } else if (hasPushError) {
      return 'Sync Failed';
    } else if (pushAttempts > 0) {
      return 'Syncing...';
    } else {
      return 'Pending Sync';
    }
  }

  factory FirstTimer.fromJson(Map<String, dynamic> json) {
    return FirstTimer(
      id: json['id'] as int,
      name: json['name'] as String,
      location: json['location'] as String?,
      primaryMobileNumber: json['primary_mobile_number'] as String,
      secondaryMobileNumber: json['secondary_mobile_number'] as String?,
      howWasService: json['how_was_service'] as String?,
      isFirstTime: json['is_first_time'] as bool? ?? true,
      hasPermanentPlaceOfWorship: json['has_permanent_place_of_worship'] as bool?,
      invitedBy: json['invited_by'] as String?,
      invitedByMemberId: json['invited_by_member_id'] as int?,
      wouldLikeToStay: json['would_like_to_stay'] as bool?,
      visitCount: json['visit_count'] as int? ?? 1,
      status: FirstTimerStatus.fromString(json['status'] as String),
      selfRegistered: json['self_registered'] as bool? ?? false,
      assignedMemberId: json['assigned_member_id'] as int?,
      deviceFingerprint: json['device_fingerprint'] as String?,
      lastSubmissionDate: json['last_submission_date'] != null 
          ? DateTime.parse(json['last_submission_date'] as String)
          : null,
      eventId: json['event_id'] as int,
      isPushedToServer: json['is_pushed_to_server'] as bool? ?? false,
      pushedAt: json['pushed_at'] != null 
          ? DateTime.parse(json['pushed_at'] as String)
          : null,
      pushError: json['push_error'] as String?,
      pushAttempts: json['push_attempts'] as int? ?? 0,
      lastPushAttempt: json['last_push_attempt'] != null 
          ? DateTime.parse(json['last_push_attempt'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'location': location,
      'primary_mobile_number': primaryMobileNumber,
      'secondary_mobile_number': secondaryMobileNumber,
      'how_was_service': howWasService,
      'is_first_time': isFirstTime,
      'has_permanent_place_of_worship': hasPermanentPlaceOfWorship,
      'invited_by': invitedBy,
      'invited_by_member_id': invitedByMemberId,
      'would_like_to_stay': wouldLikeToStay,
      'visit_count': visitCount,
      'status': status.value,
      'self_registered': selfRegistered,
      'assigned_member_id': assignedMemberId,
      'device_fingerprint': deviceFingerprint,
      'last_submission_date': lastSubmissionDate?.toIso8601String(),
      'event_id': eventId,
      'is_pushed_to_server': isPushedToServer,
      'pushed_at': pushedAt?.toIso8601String(),
      'push_error': pushError,
      'push_attempts': pushAttempts,
      'last_push_attempt': lastPushAttempt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'FirstTimer(id: $id, name: $name, status: $status, visitCount: $visitCount)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is FirstTimer && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

enum FirstTimerStatus {
  firstTimer('first_timer'),
  visitor('visitor'),
  potentialMember('potential_member');

  const FirstTimerStatus(this.value);
  
  final String value;
  
  static FirstTimerStatus fromString(String status) {
    switch (status.toLowerCase()) {
      case 'first_timer':
        return FirstTimerStatus.firstTimer;
      case 'visitor':
        return FirstTimerStatus.visitor;
      case 'potential_member':
        return FirstTimerStatus.potentialMember;
      default:
        return FirstTimerStatus.firstTimer;
    }
  }
}
