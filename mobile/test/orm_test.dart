import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:path/path.dart' as path;
import 'dart:io';

import 'package:mobile/lib/orm/base_entity.dart';
import 'package:mobile/lib/orm/orm_service.dart';
import 'package:mobile/lib/orm/entities/member_entity.dart';
import 'package:mobile/lib/orm/entities/event_entity.dart';
import 'package:mobile/lib/orm/entities/attendance_entity.dart';
import 'package:mobile/lib/orm/entities/user_entity.dart';
import 'package:mobile/lib/orm/entities/settings_entity.dart';
import 'package:mobile/lib/orm/entities/group_entity.dart';
import 'package:mobile/lib/orm/entities/family_entity.dart';
import 'package:mobile/lib/orm/repository.dart';
import 'package:mobile/lib/orm/cache.dart';
import 'package:mobile/lib/orm/relationships.dart';
import 'package:mobile/lib/orm/migrations.dart';
import 'package:mobile/lib/utils/constants.dart';

void main() {
  group('ORM Tests', () {
    late OrmService ormService;
    late Database database;

    setUpAll(() {
      // Initialize FFI for testing
      sqfliteFfiInit();
      databaseFactory = databaseFactoryFfi;
    });

    setUp(() async {
      // Create in-memory database for testing
      database = await openDatabase(
        ':memory:',
        version: 1,
        onCreate: (db, version) async {
          // Create test tables
          await _createTestTables(db);
        },
      );

      // Initialize ORM service
      ormService = OrmService();
      await ormService.initialize();
    });

    tearDown(() async {
      await database.close();
      await ormService.close();
    });

    group('BaseEntity Tests', () {
      test('should create member entity', () {
        final member = MemberEntity(
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          memberIdentificationId: 'M001',
          status: 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        expect(member.firstName, 'John');
        expect(member.lastName, 'Doe');
        expect(member.fullName, 'John Doe');
        expect(member.initials, 'JD');
        expect(member.isActive, true);
      });

      test('should convert member to database JSON', () {
        final now = DateTime.now();
        final member = MemberEntity(
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          memberIdentificationId: 'M002',
          status: 'active',
          createdAt: now,
          updatedAt: now,
        );

        final json = member.toDatabaseJson();
        expect(json['first_name'], 'Jane');
        expect(json['last_name'], 'Smith');
        expect(json['email'], 'jane.smith@example.com');
        expect(json['member_identification_id'], 'M002');
        expect(json['status'], 'active');
      });

      test('should create member from database JSON', () {
        final now = DateTime.now();
        final json = {
          'id': 1,
          'first_name': 'Bob',
          'last_name': 'Johnson',
          'email': 'bob.johnson@example.com',
          'member_identification_id': 'M003',
          'status': 'inactive',
          'created_at': now.millisecondsSinceEpoch,
          'updated_at': now.millisecondsSinceEpoch,
        };

        final member = MemberEntity.fromDatabase(json);
        expect(member.id, 1);
        expect(member.firstName, 'Bob');
        expect(member.lastName, 'Johnson');
        expect(member.email, 'bob.johnson@example.com');
        expect(member.memberIdentificationId, 'M003');
        expect(member.status, 'inactive');
        expect(member.isActive, false);
      });
    });

    group('Repository Tests', () {
      late MemberRepository memberRepository;

      setUp(() {
        memberRepository = MemberRepository();
      });

      test('should insert member', () async {
        final member = MemberEntity(
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          memberIdentificationId: 'T001',
          status: 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        final id = await memberRepository.insert(member);
        expect(id, greaterThan(0));
      });

      test('should find member by ID', () async {
        final member = MemberEntity(
          firstName: 'Find',
          lastName: 'Test',
          email: 'find@example.com',
          memberIdentificationId: 'F001',
          status: 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        final id = await memberRepository.insert(member);
        final found = await memberRepository.findById(id);
        
        expect(found, isNotNull);
        expect(found!.firstName, 'Find');
        expect(found.lastName, 'Test');
      });

      test('should update member', () async {
        final member = MemberEntity(
          firstName: 'Update',
          lastName: 'Test',
          email: 'update@example.com',
          memberIdentificationId: 'U001',
          status: 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        final id = await memberRepository.insert(member);
        final updated = member.copyWith(
          id: id,
          firstName: 'Updated',
          updatedAt: DateTime.now(),
        );

        final result = await memberRepository.update(updated);
        expect(result, 1);

        final found = await memberRepository.findById(id);
        expect(found!.firstName, 'Updated');
      });

      test('should delete member', () async {
        final member = MemberEntity(
          firstName: 'Delete',
          lastName: 'Test',
          email: 'delete@example.com',
          memberIdentificationId: 'D001',
          status: 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        final id = await memberRepository.insert(member);
        final result = await memberRepository.deleteById(id);
        expect(result, 1);

        final found = await memberRepository.findById(id);
        expect(found, isNull);
      });

      test('should find members by status', () async {
        // Insert test members
        final activeMember = MemberEntity(
          firstName: 'Active',
          lastName: 'User',
          email: 'active@example.com',
          memberIdentificationId: 'A001',
          status: 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        final inactiveMember = MemberEntity(
          firstName: 'Inactive',
          lastName: 'User',
          email: 'inactive@example.com',
          memberIdentificationId: 'I001',
          status: 'inactive',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        await memberRepository.insert(activeMember);
        await memberRepository.insert(inactiveMember);

        final activeMembers = await memberRepository.findByStatus('active');
        final inactiveMembers = await memberRepository.findByStatus('inactive');

        expect(activeMembers.length, 1);
        expect(inactiveMembers.length, 1);
        expect(activeMembers.first.status, 'active');
        expect(inactiveMembers.first.status, 'inactive');
      });

      test('should search members', () async {
        final member = MemberEntity(
          firstName: 'Search',
          lastName: 'Test',
          email: 'search@example.com',
          memberIdentificationId: 'S001',
          status: 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        await memberRepository.insert(member);

        final results = await memberRepository.search('Search');
        expect(results.length, 1);
        expect(results.first.firstName, 'Search');
      });
    });

    group('Cache Tests', () {
      late EntityCache cache;

      setUp(() {
        cache = EntityCache(maxSize: 10);
      });

      test('should put and get entity from cache', () {
        final member = MemberEntity(
          firstName: 'Cache',
          lastName: 'Test',
          email: 'cache@example.com',
          memberIdentificationId: 'C001',
          status: 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        cache.put('test_key', member);
        final retrieved = cache.get<MemberEntity>('test_key');

        expect(retrieved, isNotNull);
        expect(retrieved!.firstName, 'Cache');
        expect(retrieved.lastName, 'Test');
      });

      test('should return null for non-existent key', () {
        final retrieved = cache.get<MemberEntity>('non_existent');
        expect(retrieved, isNull);
      });

      test('should evict when cache is full', () {
        // Fill cache to max size
        for (int i = 0; i < 10; i++) {
          final member = MemberEntity(
            firstName: 'User$i',
            lastName: 'Test',
            email: 'user$i@example.com',
            memberIdentificationId: 'U$i',
            status: 'active',
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          );
          cache.put('key_$i', member);
        }

        expect(cache.size, 10);

        // Add one more to trigger eviction
        final newMember = MemberEntity(
          firstName: 'New',
          lastName: 'User',
          email: 'new@example.com',
          memberIdentificationId: 'N001',
          status: 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        cache.put('new_key', newMember);

        expect(cache.size, 10); // Should still be 10 after eviction
      });

      test('should provide cache statistics', () {
        final member = MemberEntity(
          firstName: 'Stats',
          lastName: 'Test',
          email: 'stats@example.com',
          memberIdentificationId: 'ST001',
          status: 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        cache.put('stats_key', member);
        cache.get<MemberEntity>('stats_key'); // Hit
        cache.get<MemberEntity>('miss_key'); // Miss

        final stats = cache.statistics;
        expect(stats.hitCount, 1);
        expect(stats.missCount, 1);
        expect(stats.totalEntries, 1);
      });
    });

    group('QueryBuilder Tests', () {
      test('should build simple query', () {
        final builder = QueryBuilder<MemberEntity>('members');
        final query = builder
            .where('status = ?', 'active')
            .orderBy('first_name')
            .limit(10);

        expect(query, isNotNull);
      });

      test('should build complex query', () {
        final builder = QueryBuilder<MemberEntity>('members');
        final query = builder
            .select(['id', 'first_name', 'last_name'])
            .where('status = ?', 'active')
            .whereIn('group_name', ['Group A', 'Group B'])
            .whereNotNull('email')
            .orderBy('first_name', ascending: true)
            .orderBy('last_name', ascending: false)
            .limit(20)
            .offset(10);

        expect(query, isNotNull);
      });
    });

    group('Migration Tests', () {
      late MigrationManager migrationManager;

      setUp(() {
        migrationManager = MigrationManager();
      });

      test('should register migrations', () {
        final migration = CreateUsersTableMigration();
        migrationManager.register(migration);

        expect(migrationManager._migrations.length, 1);
        expect(migrationManager._migrations.first.version, 1);
      });

      test('should sort migrations by version', () {
        migrationManager.register(CreateGroupsTableMigration());
        migrationManager.register(CreateUsersTableMigration());
        migrationManager.register(CreateFamiliesTableMigration());

        expect(migrationManager._migrations[0].version, 1);
        expect(migrationManager._migrations[1].version, 2);
        expect(migrationManager._migrations[2].version, 3);
      });
    });

    group('Relationship Tests', () {
      late RelationshipManager relationshipManager;

      setUp(() {
        relationshipManager = RelationshipManager();
      });

      test('should define relationship', () {
        relationshipManager.define<MemberEntity>('attendances', HasMany(
          name: 'attendances',
          foreignKey: 'member_id',
          fromDatabaseJson: (json) => MemberEntity.fromDatabase(json),
        ));

        expect(relationshipManager.hasRelationship<MemberEntity>('attendances'), true);
      });

      test('should get defined relationships', () {
        relationshipManager.define<MemberEntity>('attendances', HasMany(
          name: 'attendances',
          foreignKey: 'member_id',
          fromDatabaseJson: (json) => MemberEntity.fromDatabase(json),
        ));

        relationshipManager.define<MemberEntity>('group', BelongsTo(
          name: 'group',
          foreignKey: 'group_id',
          fromDatabaseJson: (json) => MemberEntity.fromDatabase(json),
        ));

        final relationships = relationshipManager.getRelationships<MemberEntity>();
        expect(relationships.length, 2);
        expect(relationships.contains('attendances'), true);
        expect(relationships.contains('group'), true);
      });
    });

    group('Integration Tests', () {
      test('should perform complete CRUD operations', () async {
        final memberRepository = MemberRepository();
        final eventRepository = EventRepository();
        final attendanceRepository = AttendanceRepository();

        // Create member
        final member = MemberEntity(
          firstName: 'Integration',
          lastName: 'Test',
          email: 'integration@example.com',
          memberIdentificationId: 'INT001',
          status: 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        final memberId = await memberRepository.insert(member);

        // Create event
        final event = EventEntity(
          title: 'Test Event',
          description: 'Integration test event',
          startDate: DateTime.now().add(Duration(days: 1)),
          status: 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        final eventId = await eventRepository.insert(event);

        // Create attendance
        final attendance = AttendanceEntity(
          memberId: memberId,
          eventId: eventId,
          status: 'present',
          checkInTime: DateTime.now(),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        final attendanceId = await attendanceRepository.insert(attendance);

        // Verify relationships
        final memberAttendances = await attendanceRepository.findByMember(memberId);
        expect(memberAttendances.length, 1);
        expect(memberAttendances.first.memberId, memberId);

        final eventAttendances = await attendanceRepository.findByEvent(eventId);
        expect(eventAttendances.length, 1);
        expect(eventAttendances.first.eventId, eventId);

        // Clean up
        await attendanceRepository.deleteById(attendanceId);
        await eventRepository.deleteById(eventId);
        await memberRepository.deleteById(memberId);
      });
    });
  });
}

/// Helper function to create test tables
Future<void> _createTestTables(Database db) async {
  // Create members table
  await db.execute('''
    CREATE TABLE ${DatabaseConstants.membersTable} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      profile_image_path TEXT,
      member_identification_id TEXT NOT NULL UNIQUE,
      group_name TEXT,
      family TEXT,
      gender TEXT,
      phone TEXT,
      date_of_birth INTEGER,
      status TEXT NOT NULL,
      last_attendance_date INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  ''');

  // Create events table
  await db.execute('''
    CREATE TABLE ${DatabaseConstants.eventsTable} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date INTEGER NOT NULL,
      end_date INTEGER,
      location TEXT,
      time TEXT,
      status TEXT NOT NULL,
      attendance_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  ''');

  // Create attendance table
  await db.execute('''
    CREATE TABLE ${DatabaseConstants.attendanceTable} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      check_in_time INTEGER NOT NULL,
      notes TEXT,
      is_first_timer INTEGER DEFAULT 0,
      version INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (member_id) REFERENCES ${DatabaseConstants.membersTable} (id),
      FOREIGN KEY (event_id) REFERENCES ${DatabaseConstants.eventsTable} (id)
    )
  ''');

  // Create users table
  await db.execute('''
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      first_name TEXT,
      last_name TEXT,
      phone TEXT,
      profile_image_path TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  ''');

  // Create groups table
  await db.execute('''
    CREATE TABLE groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT,
      icon TEXT,
      leader_id INTEGER,
      leader_name TEXT,
      member_count INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  ''');

  // Create families table
  await db.execute('''
    CREATE TABLE families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      head_of_family_id INTEGER,
      head_of_family_name TEXT,
      member_count INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  ''');

  // Create settings table
  await db.execute('''
    CREATE TABLE ${DatabaseConstants.settingsTable} (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      category TEXT,
      data_type TEXT,
      is_encrypted INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL
    )
  ''');
}
