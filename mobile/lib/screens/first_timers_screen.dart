import 'package:flutter/material.dart';
import '../models/member.dart';
import '../services/database_service_orm.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/app_drawer.dart';
import '../widgets/member_card.dart';
import 'member_profile_screen.dart';

class FirstTimersScreen extends StatefulWidget {
  const FirstTimersScreen({super.key});

  @override
  State<FirstTimersScreen> createState() => _FirstTimersScreenState();
}

class _FirstTimersScreenState extends State<FirstTimersScreen> {
  final DatabaseService _databaseService = DatabaseService();
  final TextEditingController _searchController = TextEditingController();
  
  List<Member> _firstTimers = [];
  List<Member> _filteredFirstTimers = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _initializeAndLoad();
  }

  Future<void> _initializeAndLoad() async {
    await _databaseService.initialize();
    _loadFirstTimers();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadFirstTimers() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Get all members and filter for first timers
      final List<Member> allMembers = await _databaseService.getAllMembers();
      
      // Filter for first timers (members who are new or have special status)
      final firstTimers = allMembers.where((member) {
        // You can adjust this logic based on your first timer criteria
        // For now, we'll consider members with recent creation date or specific status
        final daysSinceCreation = DateTime.now().difference(member.createdAt).inDays;
        return daysSinceCreation <= 30; // Members created within last 30 days
      }).toList();
      
      setState(() {
        _firstTimers = firstTimers;
        _applyFilters();
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading first timers: $e');
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        AppHelpers.showErrorSnackBar(context, 'Failed to load first timers: $e');
      }
    }
  }

  void _applyFilters() {
    List<Member> filtered = List.from(_firstTimers);

    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((member) {
        final fullName = member.fullName.toLowerCase();
        final email = member.email.toLowerCase();
        final memberId = member.memberIdentificationId.toLowerCase();
        final query = _searchQuery.toLowerCase();
        
        return fullName.contains(query) ||
               email.contains(query) ||
               memberId.contains(query);
      }).toList();
    }

    setState(() {
      _filteredFirstTimers = filtered;
    });
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query;
    });
    _applyFilters();
  }

  Future<void> _refreshFirstTimers() async {
    await _loadFirstTimers();
  }

  void _navigateToMemberProfile(Member member) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => MemberProfileScreen(member: member),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(),
      appBar: CustomAppBar(
        title: 'First Timers',
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshFirstTimers,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: _buildFirstTimersList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.paddingMedium),
      child: TextField(
        controller: _searchController,
        onChanged: _onSearchChanged,
        decoration: InputDecoration(
          hintText: 'Search first timers...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    _onSearchChanged('');
                  },
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
            borderSide: BorderSide.none,
          ),
          filled: true,
          fillColor: AppColors.surfaceContainer,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.paddingMedium,
            vertical: AppDimensions.paddingMedium,
          ),
        ),
      ),
    );
  }

  Widget _buildFirstTimersList() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_filteredFirstTimers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.person_add,
              size: 64,
              color: AppColors.mediumGray,
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            Text(
              _searchQuery.isNotEmpty 
                  ? 'No first timers found matching your search'
                  : 'No first timers found',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppColors.mediumGray,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingSmall),
            Text(
              _searchQuery.isNotEmpty 
                  ? 'Try adjusting your search terms'
                  : 'New members will appear here',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.mediumGray,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refreshFirstTimers,
      child: ListView.builder(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        itemCount: _filteredFirstTimers.length,
        itemBuilder: (context, index) {
          final member = _filteredFirstTimers[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: AppDimensions.paddingMedium),
            child: MemberCard(
              member: member,
              onTap: () => _navigateToMemberProfile(member),
            ),
          );
        },
      ),
    );
  }
}
