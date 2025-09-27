import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

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
  final ApiService _apiService = ApiService();
  
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
      print('DashboardProvider: Loading statistics...');
      
      // Fetch all data in parallel for better performance
      final futures = await Future.wait([
        _fetchEventsCount(),
        _fetchMembersCount(),
        _fetchGroupsCount(),
        _fetchFamiliesCount(),
      ]);

      final eventsCount = futures[0] as int;
      final membersCount = futures[1] as int;
      final groupsCount = futures[2] as int;
      final familiesCount = futures[3] as int;

      _statistics = DashboardStatistics(
        eventsCount: eventsCount,
        membersCount: membersCount,
        groupsCount: groupsCount,
        familiesCount: familiesCount,
      );

      _lastUpdated = DateTime.now();
      
      print('DashboardProvider: Statistics loaded successfully');
      print('DashboardProvider: Events: $eventsCount, Members: $membersCount, Groups: $groupsCount, Families: $familiesCount');
      
    } catch (e) {
      print('DashboardProvider: Error loading statistics: $e');
      _errorMessage = 'Failed to load statistics: ${e.toString()}';
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<int> _fetchEventsCount() async {
    try {
      print('DashboardProvider: Fetching events count...');
      final response = await _apiService.getEvents();
      
      if (response.isSuccess && response.data != null) {
        final count = response.data!.length;
        print('DashboardProvider: Events count: $count');
        return count;
      } else {
        print('DashboardProvider: Failed to fetch events: ${response.message}');
        return 0;
      }
    } catch (e) {
      print('DashboardProvider: Error fetching events count: $e');
      return 0;
    }
  }

  Future<int> _fetchMembersCount() async {
    try {
      print('DashboardProvider: Fetching members count...');
      final response = await _apiService.getAllMembers(perPage: 1); // Just get the first page to get total count
      
      if (response.isSuccess && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        
        // Try to get total count from pagination metadata
        if (data.containsKey('total')) {
          final count = data['total'] as int;
          print('DashboardProvider: Members count from total: $count');
          return count;
        } else if (data.containsKey('data') && data['data'] is List) {
          // If no total field, we'll need to fetch all pages to get accurate count
          // For now, return a placeholder or fetch more pages
          print('DashboardProvider: No total field found, fetching more members...');
          return await _fetchAllMembersCount();
        }
        
        print('DashboardProvider: Members count: 0 (no data)');
        return 0;
      } else {
        print('DashboardProvider: Failed to fetch members: ${response.message}');
        return 0;
      }
    } catch (e) {
      print('DashboardProvider: Error fetching members count: $e');
      return 0;
    }
  }

  Future<int> _fetchAllMembersCount() async {
    try {
      print('DashboardProvider: Fetching all members count...');
      int totalCount = 0;
      int page = 1;
      const perPage = 100;
      
      while (true) {
        final response = await _apiService.getAllMembers(page: page, perPage: perPage);
        
        if (response.isSuccess && response.data != null) {
          final data = response.data as Map<String, dynamic>;
          
          if (data.containsKey('data') && data['data'] is List) {
            final members = data['data'] as List;
            totalCount += members.length;
            
            // If we got fewer members than perPage, we've reached the end
            if (members.length < perPage) {
              break;
            }
            
            page++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      
      print('DashboardProvider: Total members count: $totalCount');
      return totalCount;
    } catch (e) {
      print('DashboardProvider: Error fetching all members count: $e');
      return 0;
    }
  }

  Future<int> _fetchGroupsCount() async {
    try {
      print('DashboardProvider: Fetching groups count...');
      final response = await _apiService.getAllGroups();
      
      if (response.isSuccess && response.data != null) {
        final count = response.data!.length;
        print('DashboardProvider: Groups count: $count');
        return count;
      } else {
        print('DashboardProvider: Failed to fetch groups: ${response.message}');
        return 0;
      }
    } catch (e) {
      print('DashboardProvider: Error fetching groups count: $e');
      return 0;
    }
  }

  Future<int> _fetchFamiliesCount() async {
    try {
      print('DashboardProvider: Fetching families count...');
      final response = await _apiService.getAllFamilies();
      
      if (response.isSuccess && response.data != null) {
        final count = response.data!.length;
        print('DashboardProvider: Families count: $count');
        return count;
      } else {
        print('DashboardProvider: Failed to fetch families: ${response.message}');
        return 0;
      }
    } catch (e) {
      print('DashboardProvider: Error fetching families count: $e');
      return 0;
    }
  }

  Future<void> refreshStatistics() async {
    print('DashboardProvider: Refreshing statistics...');
    await loadStatistics();
  }

  void setState(VoidCallback fn) {
    fn();
    notifyListeners();
  }

  @override
  void dispose() {
    super.dispose();
  }
}
