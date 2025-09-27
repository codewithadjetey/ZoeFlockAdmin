import 'package:flutter/material.dart';
import '../models/member.dart';
import '../services/database_service_orm.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/app_drawer.dart';
import '../widgets/member_card.dart';
import 'member_profile_screen.dart';

class GroupsScreen extends StatefulWidget {
  const GroupsScreen({super.key});

  @override
  State<GroupsScreen> createState() => _GroupsScreenState();
}

class _GroupsScreenState extends State<GroupsScreen> {
  final DatabaseService _databaseService = DatabaseService();
  final TextEditingController _searchController = TextEditingController();
  
  List<String> _groups = [];
  List<Member> _allMembers = [];
  String? _selectedGroup;
  List<Member> _filteredMembers = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _initializeAndLoad();
  }

  Future<void> _initializeAndLoad() async {
    await _databaseService.initialize();
    _loadGroupsAndMembers();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadGroupsAndMembers() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Load all members
      final List<Member> allMembers = await _databaseService.getAllMembers();
      
      // Get unique groups
      final List<String> groups = await _databaseService.getUniqueGroups();
      
      setState(() {
        _allMembers = allMembers;
        _groups = groups.where((group) => group.isNotEmpty).toList()..sort();
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

  void _selectGroup(String? group) {
    setState(() {
      _selectedGroup = group;
    });
    _applyFilters();
  }

  void _applyFilters() {
    List<Member> filtered = List.from(_allMembers);

    // Apply group filter
    if (_selectedGroup != null && _selectedGroup!.isNotEmpty) {
      filtered = filtered.where((member) {
        return member.group == _selectedGroup;
      }).toList();
    }

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
      _filteredMembers = filtered;
    });
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query;
    });
    _applyFilters();
  }

  Future<void> _refreshGroups() async {
    await _loadGroupsAndMembers();
  }

  void _navigateToMemberProfile(Member member) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => MemberProfileScreen(member: member),
      ),
    );
  }

  int _getGroupMemberCount(String group) {
    return _allMembers.where((member) => member.group == group).length;
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
          _buildGroupSelector(),
          _buildSearchBar(),
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildGroupSelector() {
    if (_groups.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Text(
          'No groups found',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppColors.mediumGray,
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(AppDimensions.paddingMedium),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Select Group',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppDimensions.paddingSmall),
          Wrap(
            spacing: AppDimensions.paddingSmall,
            children: [
              // All Groups option
              FilterChip(
                label: Text('All Groups (${_allMembers.length})'),
                selected: _selectedGroup == null,
                onSelected: (selected) => _selectGroup(null),
                backgroundColor: AppColors.surfaceContainer,
                selectedColor: AppColors.primaryBlue,
                checkmarkColor: AppColors.white,
              ),
              // Individual groups
              ..._groups.map((group) {
                final count = _getGroupMemberCount(group);
                return FilterChip(
                  label: Text('$group ($count)'),
                  selected: _selectedGroup == group,
                  onSelected: (selected) => _selectGroup(selected ? group : null),
                  backgroundColor: AppColors.surfaceContainer,
                  selectedColor: AppColors.primaryBlue,
                  checkmarkColor: AppColors.white,
                );
              }).toList(),
            ],
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
          hintText: 'Search members...',
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

    if (_filteredMembers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _selectedGroup == null ? Icons.groups : Icons.group,
              size: 64,
              color: AppColors.mediumGray,
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            Text(
              _selectedGroup == null 
                  ? 'No members found'
                  : 'No members found in ${_selectedGroup}',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppColors.mediumGray,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingSmall),
            Text(
              _searchQuery.isNotEmpty 
                  ? 'Try adjusting your search terms'
                  : 'Members will appear here when available',
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
        itemCount: _filteredMembers.length,
        itemBuilder: (context, index) {
          final member = _filteredMembers[index];
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
