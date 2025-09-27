import 'package:flutter/material.dart';
import '../models/member.dart';
import '../services/database_helper.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/app_drawer.dart';
import '../widgets/member_card.dart';
import 'member_profile_screen.dart';

class FamiliesScreen extends StatefulWidget {
  const FamiliesScreen({super.key});

  @override
  State<FamiliesScreen> createState() => _FamiliesScreenState();
}

class _FamiliesScreenState extends State<FamiliesScreen> {
  final DatabaseHelper _databaseHelper = DatabaseHelper();
  final TextEditingController _searchController = TextEditingController();
  
  List<String> _families = [];
  List<Member> _allMembers = [];
  String? _selectedFamily;
  List<Member> _filteredMembers = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadFamiliesAndMembers();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadFamiliesAndMembers() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Load all members
      final List<Map<String, dynamic>> memberData = await _databaseHelper.getAllMembers();
      final List<Member> allMembers = memberData.map((data) => Member.fromDatabase(data)).toList();
      
      // Get unique families
      final families = <String>{};
      for (final member in allMembers) {
        if (member.family != null && member.family!.isNotEmpty) {
          families.add(member.family!);
        }
      }
      
      setState(() {
        _allMembers = allMembers;
        _families = families.toList()..sort();
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading families: $e');
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        AppHelpers.showErrorSnackBar(context, 'Failed to load families: $e');
      }
    }
  }

  void _selectFamily(String? family) {
    setState(() {
      _selectedFamily = family;
    });
    _applyFilters();
  }

  void _applyFilters() {
    List<Member> filtered = List.from(_allMembers);

    // Apply family filter
    if (_selectedFamily != null && _selectedFamily!.isNotEmpty) {
      filtered = filtered.where((member) {
        return member.family == _selectedFamily;
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

  Future<void> _refreshFamilies() async {
    await _loadFamiliesAndMembers();
  }

  void _navigateToMemberProfile(Member member) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => MemberProfileScreen(member: member),
      ),
    );
  }

  int _getFamilyMemberCount(String family) {
    return _allMembers.where((member) => member.family == family).length;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(),
      appBar: CustomAppBar(
        title: 'Families',
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshFamilies,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFamilySelector(),
          _buildSearchBar(),
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildFamilySelector() {
    if (_families.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Text(
          'No families found',
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
            'Select Family',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppDimensions.paddingSmall),
          Wrap(
            spacing: AppDimensions.paddingSmall,
            children: [
              // All Families option
              FilterChip(
                label: Text('All Families (${_allMembers.length})'),
                selected: _selectedFamily == null,
                onSelected: (selected) => _selectFamily(null),
                backgroundColor: AppColors.surfaceContainer,
                selectedColor: AppColors.primaryBlue,
                checkmarkColor: AppColors.white,
              ),
              // Individual families
              ..._families.map((family) {
                final count = _getFamilyMemberCount(family);
                return FilterChip(
                  label: Text('$family ($count)'),
                  selected: _selectedFamily == family,
                  onSelected: (selected) => _selectFamily(selected ? family : null),
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
          hintText: 'Search family members...',
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
              _selectedFamily == null ? Icons.family_restroom : Icons.family_restroom,
              size: 64,
              color: AppColors.mediumGray,
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            Text(
              _selectedFamily == null 
                  ? 'No family members found'
                  : 'No members found in $_selectedFamily family',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppColors.mediumGray,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingSmall),
            Text(
              _searchQuery.isNotEmpty 
                  ? 'Try adjusting your search terms'
                  : 'Family members will appear here when available',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.mediumGray,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refreshFamilies,
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
