import 'package:sqflite/sqflite.dart';
import 'orm_service.dart';
import 'repository.dart';
import 'entities/member_entity.dart';
import 'entities/event_entity.dart';
import 'entities/attendance_entity.dart';
import '../models/member.dart';
import '../models/event.dart';
import '../models/attendance.dart';
import '../utils/constants.dart';

/// ORM Database Service that provides a clean interface for database operations
/// This service acts as a bridge between the existing models and the new ORM entities
class OrmDatabaseService {
  static final OrmDatabaseService _instance = OrmDatabaseService._internal();
  factory OrmDatabaseService() => _instance;
  OrmDatabaseService._internal();

  final OrmService _ormService = OrmService();
  late final MemberRepository _memberRepository;
  late final EventRepository _eventRepository;
  late final AttendanceRepository _attendanceRepository;

  /// Initialize the ORM database service
  Future<void> initialize() async {
    await _ormService.initialize();
    
    // Initialize repositories
    _memberRepository = MemberRepository();
    _eventRepository = EventRepository();
    _attendanceRepository = AttendanceRepository();
    
    // Register repositories with ORM service
    _ormService.registerRepository<MemberRepository>(_memberRepository);
    _ormService.registerRepository<EventRepository>(_eventRepository);
    _ormService.registerRepository<AttendanceRepository>(_attendanceRepository);
  }

  // ========== MEMBER OPERATIONS ==========

  /// Insert member
  Future<int> insertMember(Member member) async {
    final entity = _convertMemberToEntity(member);
    return await _memberRepository.insert(entity);
  }

  /// Get all members
  Future<List<Member>> getAllMembers() async {
    final entities = await _memberRepository.findAll(orderBy: 'first_name ASC, last_name ASC');
    return entities.map((entity) => _convertEntityToMember(entity)).toList();
  }

  /// Get member by ID
  Future<Member?> getMemberById(int id) async {
    final entity = await _memberRepository.findById(id);
    return entity != null ? _convertEntityToMember(entity) : null;
  }

  /// Get member by identification ID
  Future<Member?> getMemberByIdentificationId(String memberId) async {
    final entity = await _memberRepository.findByIdentificationId(memberId);
    return entity != null ? _convertEntityToMember(entity) : null;
  }

  /// Update member
  Future<int> updateMember(Member member) async {
    final entity = _convertMemberToEntity(member);
    return await _memberRepository.update(entity);
  }

  /// Delete member
  Future<int> deleteMember(int id) async {
    return await _memberRepository.deleteById(id);
  }

  /// Search members
  Future<List<Member>> searchMembers(String query) async {
    final entities = await _memberRepository.search(query, ['first_name', 'last_name', 'email', 'member_identification_id']);
    return entities.map((entity) => _convertEntityToMember(entity)).toList();
  }

  /// Get members by group
  Future<List<Member>> getMembersByGroup(String group) async {
    final entities = await _memberRepository.findByGroup(group);
    return entities.map((entity) => _convertEntityToMember(entity)).toList();
  }

  /// Get members by family
  Future<List<Member>> getMembersByFamily(String family) async {
    final entities = await _memberRepository.findByFamily(family);
    return entities.map((entity) => _convertEntityToMember(entity)).toList();
  }

  /// Get members by status
  Future<List<Member>> getMembersByStatus(String status) async {
    final entities = await _memberRepository.findByStatus(status);
    return entities.map((entity) => _convertEntityToMember(entity)).toList();
  }

  /// Get unique groups
  Future<List<String>> getUniqueGroups() async {
    return await _memberRepository.getUniqueGroups();
  }

  /// Get unique families
  Future<List<String>> getUniqueFamilies() async {
    return await _memberRepository.getUniqueFamilies();
  }

  /// Get member counts
  Future<Map<String, int>> getMemberCounts() async {
    return await _memberRepository.getMemberCounts();
  }

  /// Bulk insert members
  Future<void> insertMembers(List<Member> members) async {
    final entities = members.map((member) => _convertMemberToEntity(member)).toList();
    await _memberRepository.bulkInsert(entities);
  }

  /// Clear all members
  Future<void> clearAllMembers() async {
    await _memberRepository.deleteAll();
  }

  // ========== EVENT OPERATIONS ==========

  /// Insert event
  Future<int> insertEvent(Event event) async {
    final entity = _convertEventToEntity(event);
    return await _eventRepository.insert(entity);
  }

  /// Get all events
  Future<List<Event>> getAllEvents() async {
    final entities = await _eventRepository.findAll(orderBy: 'start_date DESC');
    return entities.map((entity) => _convertEntityToEvent(entity)).toList();
  }

  /// Get event by ID
  Future<Event?> getEventById(int id) async {
    final entity = await _eventRepository.findById(id);
    return entity != null ? _convertEntityToEvent(entity) : null;
  }

  /// Get active events
  Future<List<Event>> getActiveEvents() async {
    final entities = await _eventRepository.findActiveEvents();
    return entities.map((entity) => _convertEntityToEvent(entity)).toList();
  }

  /// Get events eligible for attendance
  Future<List<Event>> getEligibleEvents() async {
    final entities = await _eventRepository.findEligibleForAttendance();
    return entities.map((entity) => _convertEntityToEvent(entity)).toList();
  }

  /// Get today's events
  Future<List<Event>> getTodayEvents() async {
    final entities = await _eventRepository.findTodayEvents();
    return entities.map((entity) => _convertEntityToEvent(entity)).toList();
  }

  /// Update event
  Future<int> updateEvent(Event event) async {
    final entity = _convertEventToEntity(event);
    return await _eventRepository.update(entity);
  }

  /// Delete event
  Future<int> deleteEvent(int id) async {
    return await _eventRepository.deleteById(id);
  }

  /// Search events
  Future<List<Event>> searchEvents(String query) async {
    final entities = await _eventRepository.search(query, ['title', 'description', 'location']);
    return entities.map((entity) => _convertEntityToEvent(entity)).toList();
  }

  /// Get event statistics
  Future<Map<String, int>> getEventStatistics() async {
    return await _eventRepository.getEventStatistics();
  }

  /// Bulk insert events
  Future<void> insertEvents(List<Event> events) async {
    final entities = events.map((event) => _convertEventToEntity(event)).toList();
    await _eventRepository.bulkInsert(entities);
  }

  // ========== ATTENDANCE OPERATIONS ==========

  /// Insert attendance
  Future<int> insertAttendance(Attendance attendance) async {
    final entity = _convertAttendanceToEntity(attendance);
    return await _attendanceRepository.insert(entity);
  }

  /// Get all attendance
  Future<List<Attendance>> getAllAttendance() async {
    final entities = await _attendanceRepository.findAll(orderBy: 'check_in_time DESC');
    return entities.map((entity) => _convertEntityToAttendance(entity)).toList();
  }

  /// Get attendance by event
  Future<List<Attendance>> getAttendanceByEvent(int eventId) async {
    final entities = await _attendanceRepository.findByEvent(eventId);
    return entities.map((entity) => _convertEntityToAttendance(entity)).toList();
  }

  /// Get attendance by member
  Future<List<Attendance>> getAttendanceByMember(int memberId) async {
    final entities = await _attendanceRepository.findByMember(memberId);
    return entities.map((entity) => _convertEntityToAttendance(entity)).toList();
  }

  /// Get attendance by member and event
  Future<Attendance?> getAttendanceByMemberAndEvent(int memberId, int eventId) async {
    final entity = await _attendanceRepository.findByMemberAndEvent(memberId, eventId);
    return entity != null ? _convertEntityToAttendance(entity) : null;
  }

  /// Update attendance
  Future<int> updateAttendance(Attendance attendance) async {
    final entity = _convertAttendanceToEntity(attendance);
    return await _attendanceRepository.update(entity);
  }

  /// Delete attendance
  Future<int> deleteAttendance(int id) async {
    return await _attendanceRepository.deleteById(id);
  }

  /// Get attendance count for event
  Future<int> getAttendanceCountForEvent(int eventId) async {
    return await _attendanceRepository.getAttendanceCountForEvent(eventId);
  }

  /// Get attendance statistics
  Future<Map<String, int>> getAttendanceStatistics() async {
    return await _attendanceRepository.getAttendanceStatistics();
  }

  /// Bulk insert attendance
  Future<void> insertAttendanceList(List<Attendance> attendanceList) async {
    final entities = attendanceList.map((attendance) => _convertAttendanceToEntity(attendance)).toList();
    await _attendanceRepository.bulkInsert(entities);
  }

  // ========== CONVERSION METHODS ==========

  /// Convert Member model to MemberEntity
  MemberEntity _convertMemberToEntity(Member member) {
    return MemberEntity(
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      profileImagePath: member.profileImagePath,
      memberIdentificationId: member.memberIdentificationId,
      group: member.group,
      family: member.family,
      gender: member.gender,
      phone: member.phone,
      dateOfBirth: member.dateOfBirth,
      status: member.status,
      lastAttendanceDate: member.lastAttendanceDate,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    );
  }

  /// Convert MemberEntity to Member model
  Member _convertEntityToMember(MemberEntity entity) {
    return Member(
      id: entity.id ?? 0,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      profileImagePath: entity.profileImagePath,
      memberIdentificationId: entity.memberIdentificationId,
      group: entity.group,
      family: entity.family,
      gender: entity.gender,
      phone: entity.phone,
      dateOfBirth: entity.dateOfBirth,
      status: entity.status,
      lastAttendanceDate: entity.lastAttendanceDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  /// Convert Event model to EventEntity
  EventEntity _convertEventToEntity(Event event) {
    return EventEntity(
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      time: event.time,
      status: event.status,
      attendanceCount: event.attendanceCount,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    );
  }

  /// Convert EventEntity to Event model
  Event _convertEntityToEvent(EventEntity entity) {
    return Event(
      id: entity.id ?? 0,
      title: entity.title,
      description: entity.description,
      startDate: entity.startDate,
      endDate: entity.endDate,
      location: entity.location,
      time: entity.time,
      status: entity.status,
      attendanceCount: entity.attendanceCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  /// Convert Attendance model to AttendanceEntity
  AttendanceEntity _convertAttendanceToEntity(Attendance attendance) {
    return AttendanceEntity(
      id: attendance.id,
      memberId: attendance.memberId,
      eventId: attendance.eventId,
      status: attendance.status,
      checkInTime: attendance.checkInTime,
      notes: attendance.notes,
      isFirstTimer: attendance.isFirstTimer,
      version: attendance.version,
      createdAt: attendance.createdAt,
      updatedAt: attendance.updatedAt,
    );
  }

  /// Convert AttendanceEntity to Attendance model
  Attendance _convertEntityToAttendance(AttendanceEntity entity) {
    return Attendance(
      id: entity.id ?? 0,
      memberId: entity.memberId,
      eventId: entity.eventId,
      status: entity.status,
      checkInTime: entity.checkInTime,
      notes: entity.notes,
      isFirstTimer: entity.isFirstTimer,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  // ========== UTILITY METHODS ==========

  /// Get database info
  Future<Map<String, dynamic>> getDatabaseInfo() async {
    return await _ormService.getDatabaseInfo();
  }

  /// Close database
  Future<void> close() async {
    await _ormService.close();
  }

  /// Reset database
  Future<void> resetDatabase() async {
    await _ormService.resetDatabase();
  }

  /// Backup database
  Future<String> backupDatabase() async {
    return await _ormService.backupDatabase();
  }

  /// Restore database
  Future<void> restoreDatabase(String backupPath) async {
    await _ormService.restoreDatabase(backupPath);
  }

  /// Get current database version
  int get currentVersion => _ormService.currentVersion;

  /// Check if service is initialized
  bool get isInitialized => _ormService.isInitialized;

  /// Get repository by type
  T getRepository<T extends Repository>() {
    return _ormService.getRepository<T>();
  }
}
