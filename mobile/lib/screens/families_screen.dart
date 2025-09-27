import 'package:flutter/material.dart';
import '../models/member.dart';
import '../services/database_service_orm.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/app_drawer.dart';
import '../widgets/member_card.dart';
import '../widgets/family_card.dart';
import '../orm/orm_database_service.dart';
import '../orm/entities/family_entity.dart';
import 'member_profile_screen.dart';

class FamiliesScreen extends StatefulWidget {
  const FamiliesScreen({super.key});

  @override
  State<FamiliesScreen> createState() => _FamiliesScreenState();
}

class _FamiliesScreenState extends State<FamiliesScreen> {
  final DatabaseService _databaseService = DatabaseService();
  final OrmDatabaseService _ormDatabaseService = OrmDatabaseService();
  final TextEditingController _searchController = TextEditingController();
  
  List<FamilyEntity> _families = [];
  List<FamilyEntity> _filteredFamilies = [];
  bool _isLoading = true;
  String _searchQuery = '';
  bool _showFamiliesView = true; // Toggle between families view and members view

  @override
  void initState() {
    super.initState();
    _initializeAndLoad();
  }

  Future<void> _initializeAndLoad() async {
    await _databaseService.initialize();
    await _ormDatabaseService.initialize();
    _loadFamilies();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadFamilies() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Load all families from ORM service
      final List<FamilyEntity> families = await _ormDatabaseService.getAllFamilies();
      
      setState(() {
        _families = families;
        _applyFilters();
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

  void _applyFilters() {
    List<FamilyEntity> filtered = List.from(_families);

    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((family) {
        final name = family.name.toLowerCase();
        final description = family.description?.toLowerCase() ?? '';
        final address = family.address?.toLowerCase() ?? '';
        final headOfFamily = family.headOfFamilyName?.toLowerCase() ?? '';
        final query = _searchQuery.toLowerCase();
        
        return name.contains(query) ||
               description.contains(query) ||
               address.contains(query) ||
               headOfFamily.contains(query);
      }).toList();
    }

    setState(() {
      _filteredFamilies = filtered;
    });
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query;
    });
    _applyFilters();
  }

  Future<void> _refreshFamilies() async {
    await _loadFamilies();
  }

  void _navigateToFamilyDetails(FamilyEntity family) {
    // TODO: Implement family details screen
    // For now, show a dialog with family information
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(family.name),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (family.description != null) ...[
              Text('Description: ${family.description}'),
              const SizedBox(height: 8),
            ],
            Text('Members: ${family.memberCount}'),
            if (family.headOfFamilyName != null) ...[
              const SizedBox(height: 8),
              Text('Head of Family: ${family.headOfFamilyName}'),
            ],
            if (family.address != null) ...[
              const SizedBox(height: 8),
              Text('Address: ${family.address}'),
            ],
            if (family.phone != null) ...[
              const SizedBox(height: 8),
              Text('Phone: ${family.phone}'),
            ],
            const SizedBox(height: 8),
            Text('Status: ${family.isActive ? 'Active' : 'Inactive'}'),
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
                    label: const Text('Families'),
                    selected: _showFamiliesView,
                    onSelected: (selected) {
                      setState(() {
                        _showFamiliesView = true;
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
                    label: const Text('Members by Family'),
                    selected: !_showFamiliesView,
                    onSelected: (selected) {
                      setState(() {
                        _showFamiliesView = false;
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
          hintText: _showFamiliesView ? 'Search families...' : 'Search family members...',
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

    if (_showFamiliesView) {
      return _buildFamiliesList();
    } else {
      return _buildMembersByFamilyList();
    }
  }

  Widget _buildFamiliesList() {
    if (_filteredFamilies.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.family_restroom,
              size: 64,
              color: AppColors.mediumGray,
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            Text(
              _searchQuery.isNotEmpty 
                  ? 'No families found matching your search'
                  : 'No families found',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppColors.mediumGray,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingSmall),
            Text(
              _searchQuery.isNotEmpty 
                  ? 'Try adjusting your search terms'
                  : 'Families will appear here when synced',
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
        itemCount: _filteredFamilies.length,
        itemBuilder: (context, index) {
          final family = _filteredFamilies[index];
          return FamilyCard(
            name: family.name,
            description: family.description,
            address: family.address,
            phone: family.phone,
            email: family.email,
            headOfFamilyName: family.headOfFamilyName,
            memberCount: family.memberCount,
            isActive: family.isActive,
            onTap: () => _navigateToFamilyDetails(family),
          );
        },
      ),
    );
  }

  Widget _buildMembersByFamilyList() {
    // TODO: Implement members by family view
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
            'Members by Family View',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.mediumGray,
            ),
          ),
          const SizedBox(height: AppDimensions.paddingSmall),
          Text(
            'This view will show members filtered by families',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.mediumGray,
            ),
          ),
        ],
      ),
    );
  }
}
