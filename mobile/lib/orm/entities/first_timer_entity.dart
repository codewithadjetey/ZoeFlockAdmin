import 'package:sqflite/sqflite.dart';
import '../base_repository.dart';
import '../base_entity.dart';
import '../../models/first_timer.dart';
import '../../utils/constants.dart';
import 'dart:convert';

class FirstTimerEntity extends BaseEntity {
  @override
  String get tableName => 'first_timers';

  final int id;
  final String? tempId;
  final int? serverId;
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

  FirstTimerEntity({
    required this.id,
    this.tempId,
    this.serverId,
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

  @override
  Map<String, dynamic> toDatabaseJson() {
    return toMap();
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'temp_id': tempId,
      'server_id': serverId,
      'name': name,
      'location': location,
      'primary_mobile_number': primaryMobileNumber,
      'secondary_mobile_number': secondaryMobileNumber,
      'how_was_service': howWasService,
      'is_first_time': isFirstTime ? 1 : 0,
      'has_permanent_place_of_worship': hasPermanentPlaceOfWorship == null 
          ? null : (hasPermanentPlaceOfWorship! ? 1 : 0),
      'invited_by': invitedBy,
      'invited_by_member_id': invitedByMemberId,
      'would_like_to_stay': wouldLikeToStay == null 
          ? null : (wouldLikeToStay! ? 1 : 0),
      'visit_count': visitCount,
      'status': status.value,
      'self_registered': selfRegistered ? 1 : 0,
      'assigned_member_id': assignedMemberId,
      'device_fingerprint': deviceFingerprint,
      'last_submission_date': lastSubmissionDate?.toIso8601String(),
      'event_id': eventId,
      'is_pushed_to_server': isPushedToServer ? 1 : 0,
      'pushed_at': pushedAt?.toIso8601String(),
      'push_error': pushError,
      'push_attempts': pushAttempts,
      'last_push_attempt': lastPushAttempt?.toIso8601String(),
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  static FirstTimerEntity fromMap(Map<String, dynamic> map) {
    return FirstTimerEntity(
      id: map['id'] as int,
      tempId: map['temp_id'] as String?,
      serverId: map['server_id'] as int?,
      name: map['name'] as String,
      location: map['location'] as String?,
      primaryMobileNumber: map['primary_mobile_number'] as String,
      secondaryMobileNumber: map['secondary_mobile_number'] as String?,
      howWasService: map['how_was_service'] as String?,
      isFirstTime: (map['is_first_time'] as int) == 1,
      hasPermanentPlaceOfWorship: map['has_permanent_place_of_worship'] == null 
          ? null : (map['has_permanent_place_of_worship'] as int) == 1,
      invitedBy: map['invited_by'] as String?,
      invitedByMemberId: map['invited_by_member_id'] as int?,
      wouldLikeToStay: map['would_like_to_stay'] == null 
          ? null : (map['would_like_to_stay'] as int) == 1,
      visitCount: map['visit_count'] as int,
      status: FirstTimerStatus.fromString(map['status'] as String),
      selfRegistered: (map['self_registered'] as int) == 1,
      assignedMemberId: map['assigned_member_id'] as int?,
      deviceFingerprint: map['device_fingerprint'] as String?,
      lastSubmissionDate: map['last_submission_date'] != null 
          ? DateTime.parse(map['last_submission_date'] as String)
          : null,
      eventId: map['event_id'] as int,
      isPushedToServer: (map['is_pushed_to_server'] as int) == 1,
      pushedAt: map['pushed_at'] != null 
          ? DateTime.parse(map['pushed_at'] as String)
          : null,
      pushError: map['push_error'] as String?,
      pushAttempts: map['push_attempts'] as int,
      lastPushAttempt: map['last_push_attempt'] != null 
          ? DateTime.parse(map['last_push_attempt'] as String)
          : null,
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(map['updated_at'] as int),
    );
  }

  static FirstTimerEntity fromDatabase(Map<String, dynamic> json) {
    return FirstTimerEntity(
      id: json['id'] as int,
      tempId: json['temp_id'] as String?,
      serverId: json['server_id'] as int?,
      name: json['name'] as String,
      location: json['location'] as String?,
      primaryMobileNumber: json['primary_mobile_number'] as String,
      secondaryMobileNumber: json['secondary_mobile_number'] as String?,
      howWasService: json['how_was_service'] as String?,
      isFirstTime: (json['is_first_time'] as int) == 1,
      hasPermanentPlaceOfWorship: json['has_permanent_place_of_worship'] == null 
          ? null : (json['has_permanent_place_of_worship'] as int) == 1,
      invitedBy: json['invited_by'] as String?,
      invitedByMemberId: json['invited_by_member_id'] as int?,
      wouldLikeToStay: json['would_like_to_stay'] == null 
          ? null : (json['would_like_to_stay'] as int) == 1,
      visitCount: json['visit_count'] as int,
      status: FirstTimerStatus.fromString(json['status'] as String),
      selfRegistered: (json['self_registered'] as int) == 1,
      assignedMemberId: json['assigned_member_id'] as int?,
      deviceFingerprint: json['device_fingerprint'] as String?,
      lastSubmissionDate: json['last_submission_date'] != null 
          ? DateTime.parse(json['last_submission_date'] as String)
          : null,
      eventId: json['event_id'] as int,
      isPushedToServer: (json['is_pushed_to_server'] as int) == 1,
      pushedAt: json['pushed_at'] != null 
          ? DateTime.parse(json['pushed_at'] as String)
          : null,
      pushError: json['push_error'] as String?,
      pushAttempts: json['push_attempts'] as int,
      lastPushAttempt: json['last_push_attempt'] != null 
          ? DateTime.parse(json['last_push_attempt'] as String)
          : null,
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at'] as int),
    );
  }

  FirstTimer toModel() {
    return FirstTimer(
      id: serverId ?? id, // Use server ID if available, otherwise local ID
      name: name,
      location: location,
      primaryMobileNumber: primaryMobileNumber,
      secondaryMobileNumber: secondaryMobileNumber,
      howWasService: howWasService,
      isFirstTime: isFirstTime,
      hasPermanentPlaceOfWorship: hasPermanentPlaceOfWorship,
      invitedBy: invitedBy,
      invitedByMemberId: invitedByMemberId,
      wouldLikeToStay: wouldLikeToStay,
      visitCount: visitCount,
      status: status,
      selfRegistered: selfRegistered,
      assignedMemberId: assignedMemberId,
      deviceFingerprint: deviceFingerprint,
      lastSubmissionDate: lastSubmissionDate,
      eventId: eventId,
      isPushedToServer: isPushedToServer,
      pushedAt: pushedAt,
      pushError: pushError,
      pushAttempts: pushAttempts,
      lastPushAttempt: lastPushAttempt,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  FirstTimerEntity copyWith({
    int? id,
    String? tempId,
    int? serverId,
    String? name,
    String? location,
    String? primaryMobileNumber,
    String? secondaryMobileNumber,
    String? howWasService,
    bool? isFirstTime,
    bool? hasPermanentPlaceOfWorship,
    String? invitedBy,
    int? invitedByMemberId,
    bool? wouldLikeToStay,
    int? visitCount,
    FirstTimerStatus? status,
    bool? selfRegistered,
    int? assignedMemberId,
    String? deviceFingerprint,
    DateTime? lastSubmissionDate,
    int? eventId,
    bool? isPushedToServer,
    DateTime? pushedAt,
    String? pushError,
    int? pushAttempts,
    DateTime? lastPushAttempt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return FirstTimerEntity(
      id: id ?? this.id,
      tempId: tempId ?? this.tempId,
      serverId: serverId ?? this.serverId,
      name: name ?? this.name,
      location: location ?? this.location,
      primaryMobileNumber: primaryMobileNumber ?? this.primaryMobileNumber,
      secondaryMobileNumber: secondaryMobileNumber ?? this.secondaryMobileNumber,
      howWasService: howWasService ?? this.howWasService,
      isFirstTime: isFirstTime ?? this.isFirstTime,
      hasPermanentPlaceOfWorship: hasPermanentPlaceOfWorship ?? this.hasPermanentPlaceOfWorship,
      invitedBy: invitedBy ?? this.invitedBy,
      invitedByMemberId: invitedByMemberId ?? this.invitedByMemberId,
      wouldLikeToStay: wouldLikeToStay ?? this.wouldLikeToStay,
      visitCount: visitCount ?? this.visitCount,
      status: status ?? this.status,
      selfRegistered: selfRegistered ?? this.selfRegistered,
      assignedMemberId: assignedMemberId ?? this.assignedMemberId,
      deviceFingerprint: deviceFingerprint ?? this.deviceFingerprint,
      lastSubmissionDate: lastSubmissionDate ?? this.lastSubmissionDate,
      eventId: eventId ?? this.eventId,
      isPushedToServer: isPushedToServer ?? this.isPushedToServer,
      pushedAt: pushedAt ?? this.pushedAt,
      pushError: pushError ?? this.pushError,
      pushAttempts: pushAttempts ?? this.pushAttempts,
      lastPushAttempt: lastPushAttempt ?? this.lastPushAttempt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class FirstTimerRepository extends BaseRepository<FirstTimerEntity> {
  @override
  String get tableName => DatabaseConstants.firstTimersTable;

  @override
  FirstTimerEntity fromMap(Map<String, dynamic> map) => FirstTimerEntity.fromMap(map);

  @override
  FirstTimerEntity fromDatabaseJson(Map<String, dynamic> json) => FirstTimerEntity.fromDatabase(json);

  /// Create a new first timer with temporary ID
  Future<int> createFirstTimer(FirstTimerEntity firstTimer) async {
    final tempId = 'temp_${DateTime.now().millisecondsSinceEpoch}_${firstTimer.primaryMobileNumber}';
    final entityWithTempId = firstTimer.copyWith(
      tempId: tempId,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    
    return await insert(entityWithTempId);
  }

  /// Get all first timers that haven't been pushed to server
  /// Selects records where is_pushed_to_server = 0
  Future<List<FirstTimerEntity>> getUnpushedFirstTimers() async {
    final db = await database;
    print('FirstTimerRepository: Querying first timers WHERE is_pushed_to_server = 0');
    
    final List<Map<String, dynamic>> maps = await db.query(
      tableName,
      where: 'is_pushed_to_server = ?',
      whereArgs: [0],
      orderBy: 'created_at ASC',
    );

    print('FirstTimerRepository: Found ${maps.length} unpushed first timers (is_pushed_to_server = 0)');
    return List.generate(maps.length, (i) => FirstTimerEntity.fromMap(maps[i]));
  }

  /// Update first timer with server ID after successful push
  Future<void> updateWithServerId(int localId, int serverId) async {
    final db = await database;
    
    // Check current state BEFORE update
    final beforeMaps = await db.query(
      tableName,
      where: 'id = ?',
      whereArgs: [localId],
      limit: 1,
    );
    
    if (beforeMaps.isEmpty) {
      print('FirstTimerRepository: ❌ ERROR - First timer with ID $localId not found in database!');
      return;
    }
    
    final beforeState = beforeMaps.first;
    print('FirstTimerRepository: 📋 BEFORE UPDATE - ID: $localId');
    print('  - is_pushed_to_server: ${beforeState['is_pushed_to_server']}');
    print('  - server_id: ${beforeState['server_id']}');
    print('  - name: ${beforeState['name']}');
    
    print('FirstTimerRepository: 🔄 Updating first timer $localId with server ID $serverId');
    print('FirstTimerRepository: 🔄 Setting is_pushed_to_server = 1');
    
    final rowsAffected = await db.update(
      tableName,
      {
        'server_id': serverId,
        'is_pushed_to_server': 1,
        'pushed_at': DateTime.now().toIso8601String(),
        'push_error': null,
        'updated_at': DateTime.now().millisecondsSinceEpoch,
      },
      where: 'id = ?',
      whereArgs: [localId],
    );
    
    print('FirstTimerRepository: ✅ Update completed - Rows affected: $rowsAffected');
    
    if (rowsAffected == 0) {
      print('FirstTimerRepository: ⚠️ WARNING - No rows updated! ID $localId might not exist.');
    } else {
      // Check state AFTER update
      final afterMaps = await db.query(
        tableName,
        where: 'id = ?',
        whereArgs: [localId],
        limit: 1,
      );
      
      if (afterMaps.isNotEmpty) {
        final afterState = afterMaps.first;
        print('FirstTimerRepository: 📋 AFTER UPDATE - ID: $localId');
        print('  - is_pushed_to_server: ${afterState['is_pushed_to_server']} (should be 1)');
        print('  - server_id: ${afterState['server_id']} (should be $serverId)');
        print('  - pushed_at: ${afterState['pushed_at']}');
        print('  - push_error: ${afterState['push_error']}');
        
        if (afterState['is_pushed_to_server'] == 1) {
          print('FirstTimerRepository: ✅✅✅ CONFIRMED - is_pushed_to_server is NOW 1!');
        } else {
          print('FirstTimerRepository: ❌❌❌ PROBLEM - is_pushed_to_server is STILL ${afterState['is_pushed_to_server']}!');
        }
      }
      
      print('FirstTimerRepository: ✅ Successfully updated first timer $localId - is_pushed_to_server set to 1, serverId: $serverId');
    }
  }

  /// Mark first timer as pushed (without server ID - for duplicates)
  Future<void> markAsPushed(int localId) async {
    final db = await database;
    
    // Check current state BEFORE update
    final beforeMaps = await db.query(
      tableName,
      where: 'id = ?',
      whereArgs: [localId],
      limit: 1,
    );
    
    if (beforeMaps.isEmpty) {
      print('FirstTimerRepository: ❌ ERROR - First timer with ID $localId not found in database!');
      return;
    }
    
    final beforeState = beforeMaps.first;
    print('FirstTimerRepository: 📋 BEFORE UPDATE - ID: $localId');
    print('  - is_pushed_to_server: ${beforeState['is_pushed_to_server']}');
    print('  - name: ${beforeState['name']}');
    print('  - temp_id: ${beforeState['temp_id']}');
    
    print('FirstTimerRepository: 🔄 Marking first timer $localId as pushed');
    print('FirstTimerRepository: 🔄 Setting is_pushed_to_server = 1');
    
    final rowsAffected = await db.update(
      tableName,
      {
        'is_pushed_to_server': 1,
        'pushed_at': DateTime.now().toIso8601String(),
        'push_error': null,
        'updated_at': DateTime.now().millisecondsSinceEpoch,
      },
      where: 'id = ?',
      whereArgs: [localId],
    );
    
    print('FirstTimerRepository: ✅ Update completed - Rows affected: $rowsAffected');
    
    if (rowsAffected == 0) {
      print('FirstTimerRepository: ⚠️ WARNING - No rows updated! ID $localId might not exist.');
    } else {
      // Check state AFTER update
      final afterMaps = await db.query(
        tableName,
        where: 'id = ?',
        whereArgs: [localId],
        limit: 1,
      );
      
      if (afterMaps.isNotEmpty) {
        final afterState = afterMaps.first;
        print('FirstTimerRepository: 📋 AFTER UPDATE - ID: $localId');
        print('  - is_pushed_to_server: ${afterState['is_pushed_to_server']} (should be 1)');
        print('  - pushed_at: ${afterState['pushed_at']}');
        print('  - push_error: ${afterState['push_error']}');
        
        if (afterState['is_pushed_to_server'] == 1) {
          print('FirstTimerRepository: ✅✅✅ CONFIRMED - is_pushed_to_server is NOW 1!');
        } else {
          print('FirstTimerRepository: ❌❌❌ PROBLEM - is_pushed_to_server is STILL ${afterState['is_pushed_to_server']}!');
        }
      }
      
      print('FirstTimerRepository: ✅ Successfully marked first timer $localId as pushed - is_pushed_to_server set to 1');
    }
  }

  /// Update push error
  Future<void> updatePushError(int localId, String error) async {
    final db = await database;
    
    // Get current push attempts count
    final result = await db.query(
      tableName,
      columns: ['push_attempts'],
      where: 'id = ?',
      whereArgs: [localId],
      limit: 1,
    );
    
    final currentAttempts = result.isNotEmpty ? (result.first['push_attempts'] as int? ?? 0) : 0;
    
    await db.update(
      tableName,
      {
        'push_error': error,
        'push_attempts': currentAttempts + 1,
        'last_push_attempt': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().millisecondsSinceEpoch,
      },
      where: 'id = ?',
      whereArgs: [localId],
    );
  }

  /// Search first timers
  Future<List<FirstTimerEntity>> search(String query, List<String> fields, {String? orderBy}) async {
    return await super.search(query, fields, orderBy: orderBy);
  }

  /// Get first timers by status
  Future<List<FirstTimerEntity>> getByStatus(FirstTimerStatus status) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      tableName,
      where: 'status = ?',
      whereArgs: [status.value],
      orderBy: 'created_at DESC',
    );

    return List.generate(maps.length, (i) => FirstTimerEntity.fromMap(maps[i]));
  }

  /// Get first timers by event
  Future<List<FirstTimerEntity>> getByEvent(int eventId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      tableName,
      where: 'event_id = ?',
      whereArgs: [eventId],
      orderBy: 'created_at DESC',
    );

    return List.generate(maps.length, (i) => FirstTimerEntity.fromMap(maps[i]));
  }
}
