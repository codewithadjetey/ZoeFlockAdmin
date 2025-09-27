import 'package:flutter/foundation.dart';
import '../orm/orm_database_service.dart';

class DashboardStatistics {
  final int eventsCount;
  final int membersCount;
  final int groupsCount;
  final int familiesCount;

  const DashboardStatistics({
    required this.eventsCount,
    required this.membersCount,
    required this.groupsCount,
    required this.familiesCount,
  });

  DashboardStatistics copyWith({
    int? eventsCount,
    int? membersCount,
    int? groupsCount,
    int? familiesCount,
  }) {
    return DashboardStatistics(
      eventsCount: eventsCount ?? this.eventsCount,
      membersCount: membersCount ?? this.membersCount,
      groupsCount: groupsCount ?? this.groupsCount,
      familiesCount: familiesCount ?? this.familiesCount,
    );
  }
}

class DashboardProvider with ChangeNotifier {
  final OrmDatabaseService _ormDatabaseService = OrmDatabaseService();
  
  DashboardStatistics _statistics = const DashboardStatistics(
    eventsCount: 0,
    membersCount: 0,
    groupsCount: 0,
    familiesCount: 0,
  );
  
  bool _isLoading = false;
  String? _errorMessage;
  DateTime? _lastUpdated;

  DashboardStatistics get statistics => _statistics;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  DateTime? get lastUpdated => _lastUpdated;

  Future<void> loadStatistics() async {
    if (_isLoading) return;
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      print('DashboardProvider: Loading statistics from local database only...');
      
      await _ormDatabaseService.initialize();
      
      // Fetch all local data in parallel
      final futures = await Future.wait([
        _ormDatabaseService.getAllEvents(),
        _ormDatabaseService.getAllMembers(),
        _ormDatabaseService.getAllGroups(),
        _ormDatabaseService.getAllFamilies(),
      ]);

      final events = futures[0] as List;
      final members = futures[1] as List;
      final groups = futures[2] as List;
      final families = futures[3] as List;

      _statistics = DashboardStatistics(
        eventsCount: events.length,
        membersCount: members.length,
        groupsCount: groups.length,
        familiesCount: families.length,
      );

      _lastUpdated = DateTime.now();
      
      print('DashboardProvider: Local statistics loaded successfully');
      print('DashboardProvider: Events: ${events.length}, Members: ${members.length}, Groups: ${groups.length}, Families: ${families.length}');
      
    } catch (e) {
      print('DashboardProvider: Error loading local statistics: $e');
      _errorMessage = 'Failed to load statistics: ${e.toString()}';
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void setState(VoidCallback fn) {
    fn();
    notifyListeners();
  }
}