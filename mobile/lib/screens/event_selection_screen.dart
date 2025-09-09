import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/event_provider.dart';
import '../providers/attendance_provider.dart';
import '../models/event.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../widgets/event_card.dart';
import '../widgets/custom_app_bar.dart';

class EventSelectionScreen extends StatefulWidget {
  const EventSelectionScreen({super.key});

  @override
  State<EventSelectionScreen> createState() => _EventSelectionScreenState();
}

class _EventSelectionScreenState extends State<EventSelectionScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  bool _showOnlyActive = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadEvents();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadEvents() async {
    final eventProvider = Provider.of<EventProvider>(context, listen: false);
    await eventProvider.refreshEvents();
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query;
    });
  }

  void _toggleFilter() {
    setState(() {
      _showOnlyActive = !_showOnlyActive;
    });
  }

  List<Event> _getFilteredEvents() {
    final eventProvider = Provider.of<EventProvider>(context, listen: false);
    List<Event> events = _showOnlyActive ? eventProvider.activeEvents : eventProvider.events;
    
    if (_searchQuery.isNotEmpty) {
      events = events.where((event) {
        final title = event.title.toLowerCase();
        final description = event.description?.toLowerCase() ?? '';
        final location = event.location?.toLowerCase() ?? '';
        final query = _searchQuery.toLowerCase();
        
        return title.contains(query) ||
               description.contains(query) ||
               location.contains(query);
      }).toList();
    }
    
    return events;
  }

  Future<void> _selectEvent(Event event) async {
    final eventProvider = Provider.of<EventProvider>(context, listen: false);
    await eventProvider.selectEvent(event);
    
    if (mounted) {
      Navigator.of(context).pushNamed('/scanner');
    }
  }

  Future<void> _refreshEvents() async {
    final eventProvider = Provider.of<EventProvider>(context, listen: false);
    await eventProvider.refreshEvents();
    
    if (mounted) {
      AppHelpers.showSuccessSnackBar(context, 'Events refreshed');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: AppStrings.eventSelectionTitle,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshEvents,
            tooltip: AppStrings.refreshEvents,
          ),
          IconButton(
            icon: Icon(_showOnlyActive ? Icons.filter_list : Icons.filter_list_off),
            onPressed: _toggleFilter,
            tooltip: _showOnlyActive ? 'Show all events' : 'Show active events only',
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => Navigator.of(context).pushNamed('/settings'),
            tooltip: 'Settings',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          _buildFilterChips(),
          Expanded(
            child: _buildEventsList(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // TODO: Implement create new event
          AppHelpers.showInfoSnackBar(context, 'Create event feature coming soon');
        },
        icon: const Icon(Icons.add),
        label: const Text('New Event'),
        backgroundColor: AppColors.primaryBlue,
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
          hintText: 'Search events...',
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
      child: Row(
        children: [
          FilterChip(
            label: Text(_showOnlyActive ? 'Active' : 'All'),
            selected: true,
            onSelected: (_) => _toggleFilter(),
            selectedColor: AppColors.primaryBlue.withOpacity(0.2),
            checkmarkColor: AppColors.primaryBlue,
          ),
          const SizedBox(width: AppDimensions.paddingSmall),
          Consumer<EventProvider>(
            builder: (context, eventProvider, child) {
              if (eventProvider.isOffline) {
                return Chip(
                  label: const Text('Offline'),
                  backgroundColor: AppColors.warning.withOpacity(0.2),
                  labelStyle: const TextStyle(color: AppColors.warning),
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEventsList() {
    return Consumer<EventProvider>(
      builder: (context, eventProvider, child) {
        if (eventProvider.isLoading) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        }

        if (eventProvider.errorMessage != null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 64,
                  color: AppColors.error,
                ),
                const SizedBox(height: AppDimensions.paddingMedium),
                Text(
                  eventProvider.errorMessage!,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppColors.error,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppDimensions.paddingMedium),
                ElevatedButton(
                  onPressed: _refreshEvents,
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        final events = _getFilteredEvents();

        if (events.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.event_busy,
                  size: 64,
                  color: AppColors.mediumGray,
                ),
                const SizedBox(height: AppDimensions.paddingMedium),
                Text(
                  _searchQuery.isNotEmpty
                      ? 'No events found for "$_searchQuery"'
                      : AppStrings.noEvents,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppColors.mediumGray,
                  ),
                  textAlign: TextAlign.center,
                ),
                if (_searchQuery.isNotEmpty) ...[
                  const SizedBox(height: AppDimensions.paddingMedium),
                  TextButton(
                    onPressed: () {
                      _searchController.clear();
                      _onSearchChanged('');
                    },
                    child: const Text('Clear search'),
                  ),
                ],
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: _refreshEvents,
          child: ListView.builder(
            padding: const EdgeInsets.all(AppDimensions.paddingMedium),
            itemCount: events.length,
            itemBuilder: (context, index) {
              final event = events[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: AppDimensions.paddingMedium),
                child: EventCard(
                  event: event,
                  onTap: () => _selectEvent(event),
                  onAttendanceCountTap: () {
                    // TODO: Show attendance details
                    AppHelpers.showInfoSnackBar(context, 'Attendance details coming soon');
                  },
                ),
              );
            },
          ),
        );
      },
    );
  }
}
