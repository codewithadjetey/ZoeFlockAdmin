import 'package:flutter/material.dart';
import '../models/member.dart';
import '../services/database_service_orm.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/app_drawer.dart';
import '../widgets/member_card.dart';
import 'member_profile_screen.dart';

class MembersScreen extends StatefulWidget {
  const MembersScreen({super.key});

  @override
  State<MembersScreen> createState() => _MembersScreenState();
}

class _MembersScreenState extends State<MembersScreen> {
  final DatabaseService _databaseService = DatabaseService();
  final TextEditingController _searchController = TextEditingController();
  
  List<Member> _members = [];
  List<Member> _filteredMembers = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _selectedFilter = 'All';
  String? _selectedGroup;
  List<String> _availableGroups = [];

  @override
  void initState() {
    super.initState();
    _initializeAndLoad();
  }

  Future<void> _initializeAndLoad() async {
    await _databaseService.initialize();
    _loadMembers();
    _loadGroups();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadMembers() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final List<Member> members = await _databaseService.getAllMembers();
      
      setState(() {
        _members = members;
        _applyFilters();
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading members: $e');
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        AppHelpers.showErrorSnackBar(context, 'Failed to load members: $e');
      }
    }
  }


  Future<void> _loadGroups() async {
    try {
      final groups = await _databaseService.getUniqueGroups();
      setState(() {
        _availableGroups = groups;
      });
    } catch (e) {
      print('Error loading groups: $e');
    }
  }

  void _applyFilters() {
    List<Member> filtered = List.from(_members);

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

    // Apply status filter
    if (_selectedFilter != 'All') {
      filtered = filtered.where((member) {
        if (_selectedFilter == 'Active') {
          return member.isActive;
        } else if (_selectedFilter == 'Inactive') {
          return !member.isActive;
        }
        return true;
      }).toList();
    }

    // Apply group filter
    if (_selectedGroup != null && _selectedGroup!.isNotEmpty) {
      filtered = filtered.where((member) => member.group == _selectedGroup).toList();
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

  void _onFilterChanged(String filter) {
    setState(() {
      _selectedFilter = filter;
    });
    _applyFilters();
  }

  void _onGroupChanged(String? group) {
    setState(() {
      _selectedGroup = group;
    });
    _applyFilters();
  }

  void _clearFilters() {
    setState(() {
      _searchQuery = '';
      _selectedFilter = 'All';
      _selectedGroup = null;
    });
    _searchController.clear();
    _applyFilters();
  }

  Future<void> _refreshMembers() async {
    await _loadMembers();
    await _loadGroups();
  }

  void _showMemberProfile(Member member) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => MemberProfileScreen(
          member: member,
          onAttendanceMarked: () {
            // Refresh members after attendance is marked
            _refreshMembers();
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(),
      appBar: CustomAppBar(
        title: 'Members',
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshMembers,
            tooltip: 'Refresh Members',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          _buildFilterChips(),
          Expanded(
            child: _buildMembersList(),
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
          hintText: 'Search members by name, email, or ID...',
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

  Widget _buildFilterChips() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.paddingMedium),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            // Status filters
            FilterChip(
              label: const Text('All'),
              selected: _selectedFilter == 'All',
              onSelected: (_) => _onFilterChanged('All'),
              selectedColor: AppColors.primaryBlue.withOpacity(0.2),
              checkmarkColor: AppColors.primaryBlue,
            ),
            const SizedBox(width: AppDimensions.paddingSmall),
            FilterChip(
              label: const Text('Active'),
              selected: _selectedFilter == 'Active',
              onSelected: (_) => _onFilterChanged('Active'),
              selectedColor: AppColors.success.withOpacity(0.2),
              checkmarkColor: AppColors.success,
            ),
            const SizedBox(width: AppDimensions.paddingSmall),
            FilterChip(
              label: const Text('Inactive'),
              selected: _selectedFilter == 'Inactive',
              onSelected: (_) => _onFilterChanged('Inactive'),
              selectedColor: AppColors.error.withOpacity(0.2),
              checkmarkColor: AppColors.error,
            ),
            
            // Group filter dropdown
            if (_availableGroups.isNotEmpty) ...[
              const SizedBox(width: AppDimensions.paddingMedium),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.paddingSmall),
                decoration: BoxDecoration(
                  color: _selectedGroup != null 
                      ? AppColors.primaryBlue.withOpacity(0.2)
                      : AppColors.surfaceContainer,
                  borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
                  border: Border.all(
                    color: _selectedGroup != null 
                        ? AppColors.primaryBlue
                        : AppColors.onSurfaceVariant.withOpacity(0.3),
                  ),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedGroup,
                    hint: const Text('Group'),
                    isDense: true,
                    items: [
                      const DropdownMenuItem<String>(
                        value: null,
                        child: Text('All Groups'),
                      ),
                      ..._availableGroups.map((group) => DropdownMenuItem<String>(
                        value: group,
                        child: Text(group),
                      )),
                    ],
                    onChanged: _onGroupChanged,
                    style: TextStyle(
                      color: AppColors.onSurface,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ],
            
            // Clear filters button
            if (_selectedFilter != 'All' || _selectedGroup != null || _searchQuery.isNotEmpty) ...[
              const SizedBox(width: AppDimensions.paddingSmall),
              ActionChip(
                label: const Text('Clear'),
                onPressed: _clearFilters,
                backgroundColor: AppColors.warning.withOpacity(0.2),
                labelStyle: const TextStyle(color: AppColors.warning),
              ),
            ],
          ],
        ),
      ),
    );
  }


  Widget _buildMembersList() {
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
              Icons.people_outline,
              size: 64,
              color: AppColors.mediumGray,
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            Text(
              _searchQuery.isNotEmpty || _selectedFilter != 'All' || _selectedGroup != null
                  ? 'No members found matching your criteria'
                  : 'No members found in database',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: AppColors.mediumGray,
              ),
              textAlign: TextAlign.center,
            ),
            if (_searchQuery.isNotEmpty || _selectedFilter != 'All' || _selectedGroup != null) ...[
              const SizedBox(height: AppDimensions.paddingMedium),
              TextButton(
                onPressed: _clearFilters,
                child: const Text('Clear filters'),
              ),
            ],
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refreshMembers,
      child: ListView.builder(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        itemCount: _filteredMembers.length,
        itemBuilder: (context, index) {
          final member = _filteredMembers[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: AppDimensions.paddingMedium),
            child: MemberCard(
              member: member,
              onTap: () => _showMemberProfile(member),
              showStatus: true,
            ),
          );
        },
      ),
    );
  }
}
