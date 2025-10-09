import 'package:flutter/material.dart';
import '../models/first_timer.dart';
import '../orm/orm_database_service.dart';
import '../orm/entities/first_timer_entity.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/app_drawer.dart';
import '../widgets/first_timer_card.dart';
import 'add_first_timer_screen.dart';

class FirstTimersScreen extends StatefulWidget {
  const FirstTimersScreen({super.key});

  @override
  State<FirstTimersScreen> createState() => _FirstTimersScreenState();
}

class _FirstTimersScreenState extends State<FirstTimersScreen> with WidgetsBindingObserver, RouteAware {
  final OrmDatabaseService _ormDatabaseService = OrmDatabaseService();
  final TextEditingController _searchController = TextEditingController();
  
  List<FirstTimer> _firstTimers = [];
  List<FirstTimer> _filteredFirstTimers = [];
  bool _isLoading = true;
  String _searchQuery = '';
  FirstTimerStatus? _selectedStatus;
  DateTime? _lastLoadTime;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadFirstTimers();
  }
  
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    // Refresh data when app comes back to foreground
    if (state == AppLifecycleState.resumed && mounted) {
      print('FirstTimersScreen: App resumed, refreshing data...');
      _loadFirstTimers();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _searchController.dispose();
    super.dispose();
  }

  // Force refresh whenever the page comes into view
  void _autoRefreshIfNeeded() {
    // Refresh if more than 2 seconds have passed since last load
    if (_lastLoadTime == null || 
        DateTime.now().difference(_lastLoadTime!) > const Duration(seconds: 2)) {
      print('FirstTimersScreen: Auto-refreshing data (last load: $_lastLoadTime)...');
      _loadFirstTimers();
    }
  }

  Future<void> _loadFirstTimers() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
    });

    try {
      print('FirstTimersScreen: Loading first timers from local database...');
      
      await _ormDatabaseService.initialize();
      final firstTimerEntities = await _ormDatabaseService.getAllFirstTimers();
      final firstTimers = firstTimerEntities.map((entity) => entity.toModel()).toList();
      
      print('FirstTimersScreen: Loaded ${firstTimers.length} first timers from local database');
      
      // Debug: Print sync status of first few records
      if (firstTimers.isNotEmpty) {
        for (var i = 0; i < (firstTimers.length > 3 ? 3 : firstTimers.length); i++) {
          final ft = firstTimers[i];
          print('FirstTimersScreen: Record ${i + 1} - isPushed: ${ft.isPushedToServer}, pushError: ${ft.pushError}, status: ${ft.pushStatus}');
        }
      }
      
      if (mounted) {
        setState(() {
          _firstTimers = firstTimers;
          _applyFilters();
          _isLoading = false;
          _lastLoadTime = DateTime.now();
        });
      }
      
    } catch (e) {
      print('FirstTimersScreen: Error loading first timers: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        AppHelpers.showErrorSnackBar(context, 'Failed to load first timers: $e');
      }
    }
  }

  void _applyFilters() {
    List<FirstTimer> filtered = List.from(_firstTimers);

    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((firstTimer) {
        final name = firstTimer.name.toLowerCase();
        final phone = firstTimer.primaryMobileNumber.toLowerCase();
        final location = (firstTimer.location ?? '').toLowerCase();
        final query = _searchQuery.toLowerCase();
        
        return name.contains(query) ||
               phone.contains(query) ||
               location.contains(query);
      }).toList();
    }

    // Apply status filter
    if (_selectedStatus != null) {
      filtered = filtered.where((firstTimer) => firstTimer.status == _selectedStatus).toList();
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

  void _onStatusFilterChanged(FirstTimerStatus? status) {
    setState(() {
      _selectedStatus = status;
    });
    _applyFilters();
  }

  Future<void> _refreshFirstTimers() async {
    await _loadFirstTimers();
  }

  Future<void> _navigateToAddFirstTimer() async {
    final result = await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const AddFirstTimerScreen(),
      ),
    );
    
    // Refresh the list if a first timer was successfully added
    if (result == true) {
      await _refreshFirstTimers();
    }
  }

  Future<void> _navigateToEditFirstTimer(FirstTimer firstTimer) async {
    final result = await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => AddFirstTimerScreen(firstTimerToEdit: firstTimer),
      ),
    );
    
    // Refresh the list if a first timer was successfully updated
    if (result == true) {
      await _refreshFirstTimers();
    }
  }

  void _navigateToFirstTimerDetails(FirstTimer firstTimer) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(firstTimer.name),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDetailRow('Status', firstTimer.statusDisplayName),
              _buildDetailRow('Visit Count', firstTimer.visitCountDisplay),
              _buildDetailRow('Primary Phone', firstTimer.primaryMobileNumber),
              if (firstTimer.hasSecondaryPhone)
                _buildDetailRow('Secondary Phone', firstTimer.secondaryPhone),
              if (firstTimer.location != null && firstTimer.location!.isNotEmpty)
                _buildDetailRow('Location', firstTimer.location!),
              if (firstTimer.invitedBy != null && firstTimer.invitedBy!.isNotEmpty)
                _buildDetailRow('Invited By', firstTimer.invitedBy!),
              if (firstTimer.howWasService != null && firstTimer.howWasService!.isNotEmpty)
                _buildDetailRow('Service Feedback', firstTimer.howWasService!),
              if (firstTimer.wouldLikeToStay != null)
                _buildDetailRow('Would Like to Stay', firstTimer.wouldLikeToStay! ? 'Yes' : 'No'),
              _buildDetailRow('Registration Date', AppHelpers.formatDate(firstTimer.createdAt)),
              if (firstTimer.lastSubmissionDate != null)
                _buildDetailRow('Last Visit', AppHelpers.formatDate(firstTimer.lastSubmissionDate!)),
            ],
          ),
        ),
        actions: [
          if (!firstTimer.isPushedToServer)
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _navigateToEditFirstTimer(firstTimer);
              },
              child: const Text('Edit'),
            ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppDimensions.paddingSmall),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
                color: AppColors.onSurfaceVariant,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.onSurface,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Auto-refresh if needed when widget rebuilds
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _autoRefreshIfNeeded();
    });
    
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(),
      appBar: CustomAppBar(
        title: 'First Timers',
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _navigateToAddFirstTimer,
            tooltip: 'Add First Timer',
          ),
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
          _buildStatusFilters(),
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
          hintText: 'Search first timers by name, phone, or location...',
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

  Widget _buildStatusFilters() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.paddingMedium),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            // All filter
            FilterChip(
              label: const Text('All'),
              selected: _selectedStatus == null,
              onSelected: (selected) {
                if (selected) {
                  _onStatusFilterChanged(null);
                }
              },
            ),
            const SizedBox(width: AppDimensions.paddingSmall),
            // First Timer filter
            FilterChip(
              label: const Text('First Timer'),
              selected: _selectedStatus == FirstTimerStatus.firstTimer,
              onSelected: (selected) {
                if (selected) {
                  _onStatusFilterChanged(FirstTimerStatus.firstTimer);
                }
              },
            ),
            const SizedBox(width: AppDimensions.paddingSmall),
            // Visitor filter
            FilterChip(
              label: const Text('Visitor'),
              selected: _selectedStatus == FirstTimerStatus.visitor,
              onSelected: (selected) {
                if (selected) {
                  _onStatusFilterChanged(FirstTimerStatus.visitor);
                }
              },
            ),
            const SizedBox(width: AppDimensions.paddingSmall),
            // Potential Member filter
            FilterChip(
              label: const Text('Potential Member'),
              selected: _selectedStatus == FirstTimerStatus.potentialMember,
              onSelected: (selected) {
                if (selected) {
                  _onStatusFilterChanged(FirstTimerStatus.potentialMember);
                }
              },
            ),
          ],
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
              _searchQuery.isNotEmpty || _selectedStatus != null
                  ? 'No first timers found matching your filters'
                  : 'No first timers found',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppColors.mediumGray,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingSmall),
            Text(
              _searchQuery.isNotEmpty || _selectedStatus != null
                  ? 'Try adjusting your search terms or filters'
                  : 'First timers will appear here when they register',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.mediumGray,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(AppDimensions.paddingMedium),
      itemCount: _filteredFirstTimers.length,
      itemBuilder: (context, index) {
        final firstTimer = _filteredFirstTimers[index];
        return FirstTimerCard(
          firstTimer: firstTimer,
          onTap: () => _navigateToFirstTimerDetails(firstTimer),
          onEdit: !firstTimer.isPushedToServer 
              ? () => _navigateToEditFirstTimer(firstTimer)
              : null,
        );
      },
    );
  }
}
