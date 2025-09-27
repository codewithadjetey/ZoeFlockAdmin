import 'package:flutter/material.dart';
import '../models/member.dart';
import '../services/database_service_orm.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/app_drawer.dart';
import '../widgets/member_card.dart';
import '../widgets/group_card.dart';
import '../orm/orm_database_service.dart';
import '../orm/entities/group_entity.dart';
import 'member_profile_screen.dart';

class GroupsScreen extends StatefulWidget {
  const GroupsScreen({super.key});

  @override
  State<GroupsScreen> createState() => _GroupsScreenState();
}

class _GroupsScreenState extends State<GroupsScreen> {
  final DatabaseService _databaseService = DatabaseService();
  final OrmDatabaseService _ormDatabaseService = OrmDatabaseService();
  final TextEditingController _searchController = TextEditingController();
  
  List<GroupEntity> _groups = [];
  List<GroupEntity> _filteredGroups = [];
  bool _isLoading = true;
  String _searchQuery = '';
  bool _showGroupsView = true; // Toggle between groups view and members view

  @override
  void initState() {
    super.initState();
    _initializeAndLoad();
  }

  Future<void> _initializeAndLoad() async {
    await _databaseService.initialize();
    await _ormDatabaseService.initialize();
    _loadGroups();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadGroups() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Load all groups from ORM service
      final List<GroupEntity> groups = await _ormDatabaseService.getAllGroups();
      
      setState(() {
        _groups = groups;
        _applyFilters();
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading groups: $e');
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        AppHelpers.showErrorSnackBar(context, 'Failed to load groups: $e');
      }
    }
  }

  void _applyFilters() {
    List<GroupEntity> filtered = List.from(_groups);

    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((group) {
        final name = group.name.toLowerCase();
        final description = group.description?.toLowerCase() ?? '';
        final leaderName = group.leaderName?.toLowerCase() ?? '';
        final query = _searchQuery.toLowerCase();
        
        return name.contains(query) ||
               description.contains(query) ||
               leaderName.contains(query);
      }).toList();
    }

    setState(() {
      _filteredGroups = filtered;
    });
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query;
    });
    _applyFilters();
  }

  Future<void> _refreshGroups() async {
    await _loadGroups();
  }

  void _navigateToGroupDetails(GroupEntity group) {
    // TODO: Implement group details screen
    // For now, show a dialog with group information
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(group.name),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (group.description != null) ...[
              Text('Description: ${group.description}'),
              const SizedBox(height: 8),
            ],
            Text('Members: ${group.memberCount}'),
            if (group.leaderName != null) ...[
              const SizedBox(height: 8),
              Text('Leader: ${group.leaderName}'),
            ],
            const SizedBox(height: 8),
            Text('Status: ${group.isActive ? 'Active' : 'Inactive'}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(),
      appBar: CustomAppBar(
        title: 'Groups',
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshGroups,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildViewToggle(),
          _buildSearchBar(),
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildViewToggle() {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.paddingMedium),
      child: Row(
        children: [
          Text(
            'View:',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: AppDimensions.paddingSmall),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: FilterChip(
                    label: const Text('Groups'),
                    selected: _showGroupsView,
                    onSelected: (selected) {
                      setState(() {
                        _showGroupsView = true;
                      });
                    },
                    backgroundColor: AppColors.surfaceContainer,
                    selectedColor: AppColors.primaryBlue,
                    checkmarkColor: AppColors.white,
                  ),
                ),
                const SizedBox(width: AppDimensions.paddingSmall),
                Expanded(
                  child: FilterChip(
                    label: const Text('Members by Group'),
                    selected: !_showGroupsView,
                    onSelected: (selected) {
                      setState(() {
                        _showGroupsView = false;
                      });
                    },
                    backgroundColor: AppColors.surfaceContainer,
                    selectedColor: AppColors.primaryBlue,
                    checkmarkColor: AppColors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.paddingMedium),
      child: TextField(
        controller: _searchController,
        onChanged: _onSearchChanged,
        decoration: InputDecoration(
          hintText: _showGroupsView ? 'Search groups...' : 'Search members...',
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

  Widget _buildContent() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_showGroupsView) {
      return _buildGroupsList();
    } else {
      return _buildMembersByGroupList();
    }
  }

  Widget _buildGroupsList() {
    if (_filteredGroups.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.groups,
              size: 64,
              color: AppColors.mediumGray,
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            Text(
              _searchQuery.isNotEmpty 
                  ? 'No groups found matching your search'
                  : 'No groups found',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppColors.mediumGray,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingSmall),
            Text(
              _searchQuery.isNotEmpty 
                  ? 'Try adjusting your search terms'
                  : 'Groups will appear here when synced',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.mediumGray,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refreshGroups,
      child: ListView.builder(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        itemCount: _filteredGroups.length,
        itemBuilder: (context, index) {
          final group = _filteredGroups[index];
          return GroupCard(
            name: group.name,
            description: group.description,
            color: group.color,
            icon: group.icon,
            leaderName: group.leaderName,
            memberCount: group.memberCount,
            isActive: group.isActive,
            onTap: () => _navigateToGroupDetails(group),
          );
        },
      ),
    );
  }

  Widget _buildMembersByGroupList() {
    // TODO: Implement members by group view
    // For now, show a placeholder
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.people,
            size: 64,
            color: AppColors.mediumGray,
          ),
          const SizedBox(height: AppDimensions.paddingMedium),
          Text(
            'Members by Group View',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.mediumGray,
            ),
          ),
          const SizedBox(height: AppDimensions.paddingSmall),
          Text(
            'This view will show members filtered by groups',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.mediumGray,
            ),
          ),
        ],
      ),
    );
  }
}
