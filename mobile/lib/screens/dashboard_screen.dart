import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/event_provider.dart';
import '../providers/dashboard_provider.dart';
import '../services/user_config_service.dart';
import '../utils/constants.dart';
import '../utils/responsive_size.dart';
import '../widgets/app_drawer.dart';
import '../widgets/custom_app_bar.dart';
import 'event_selection_screen.dart';
import 'members_screen.dart';
import 'groups_screen.dart';
import 'families_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late UserConfigService _userConfigService;

  @override
  void initState() {
    super.initState();
    _userConfigService = UserConfigService();
    
    // Defer initialization until after the build phase
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeDashboard();
    });
  }

  Future<void> _initializeDashboard() async {
    try {
      // Load dashboard statistics
      final dashboardProvider = Provider.of<DashboardProvider>(context, listen: false);
      await dashboardProvider.loadStatistics();
    } catch (e) {
      print('Error initializing dashboard: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(),
      appBar: CustomAppBar(
        title: 'Dashboard',
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _initializeDashboard,
            tooltip: 'Refresh Dashboard',
          ),
        ],
      ),
      body: Consumer<DashboardProvider>(
        builder: (context, dashboardProvider, child) {
          if (dashboardProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (dashboardProvider.errorMessage != null) {
            final responsive = ResponsiveSize(context);
            
            return Center(
              child: Padding(
                padding: EdgeInsets.all(responsive.paddingLarge),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: responsive.scale(64),
                      color: AppColors.error,
                    ),
                    SizedBox(height: responsive.paddingMedium),
                    Text(
                      dashboardProvider.errorMessage!,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: AppColors.error,
                        fontSize: responsive.fontSizeLarge,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: responsive.paddingMedium),
                    ElevatedButton(
                      onPressed: () => _initializeDashboard(),
                      style: ElevatedButton.styleFrom(
                        minimumSize: Size(
                          responsive.wp(40),
                          responsive.buttonHeightMedium,
                        ),
                      ),
                      child: Text(
                        'Retry',
                        style: TextStyle(fontSize: responsive.fontSizeMedium),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          final responsive = ResponsiveSize(context);
          
          return RefreshIndicator(
              onRefresh: _initializeDashboard,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.all(responsive.paddingMedium),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildWelcomeCard(),
                    SizedBox(height: responsive.paddingLarge),
                    _buildStatisticsSection(),
                    SizedBox(height: responsive.paddingLarge),
                    _buildQuickActionsSection(),
                    SizedBox(height: responsive.paddingLarge),
                    _buildRecentActivitySection(),
                  ],
                ),
              ),
            );
        },
      ),
    );
  }

  Widget _buildWelcomeCard() {
    final responsive = ResponsiveSize(context);
    final currentHour = DateTime.now().hour;
    String greeting;
    
    if (currentHour < 12) {
      greeting = 'Good Morning';
    } else if (currentHour < 17) {
      greeting = 'Good Afternoon';
    } else {
      greeting = 'Good Evening';
    }

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(responsive.paddingLarge),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primaryBlue,
            AppColors.primaryBlue.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(responsive.radiusLarge),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryBlue.withOpacity(0.3),
            blurRadius: responsive.scale(20),
            offset: Offset(0, responsive.scale(10)),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: responsive.scale(28),
                backgroundColor: AppColors.white,
                child: Text(
                  _userConfigService.userInitials,
                  style: TextStyle(
                    fontSize: responsive.fontSizeLarge,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryBlue,
                  ),
                ),
              ),
              SizedBox(width: responsive.paddingMedium),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      greeting,
                      style: TextStyle(
                        fontSize: responsive.fontSizeMedium,
                        color: AppColors.white.withOpacity(0.9),
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: responsive.scale(4)),
                    Text(
                      _userConfigService.userFullName,
                      style: TextStyle(
                        fontSize: responsive.fontSizeLarge,
                        fontWeight: FontWeight.bold,
                        color: AppColors.white,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.church,
                color: AppColors.white.withOpacity(0.8),
                size: responsive.iconSizeLarge,
              ),
            ],
          ),
          SizedBox(height: responsive.paddingMedium),
          Text(
            'Welcome to Zoe Flock Admin',
            style: TextStyle(
              fontSize: responsive.fontSizeMedium,
              color: AppColors.white.withOpacity(0.9),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          SizedBox(height: responsive.scale(4)),
          Text(
            'Manage your church community with ease',
            style: TextStyle(
              fontSize: responsive.fontSizeSmall,
              color: AppColors.white.withOpacity(0.7),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildStatisticsSection() {
    final responsive = ResponsiveSize(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Overview',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.onSurface,
            fontWeight: FontWeight.bold,
            fontSize: responsive.fontSizeXLarge,
          ),
        ),
        SizedBox(height: responsive.paddingMedium),
        Consumer<DashboardProvider>(
          builder: (context, dashboardProvider, child) {
            return GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: responsive.gridColumnCount,
              crossAxisSpacing: responsive.paddingMedium,
              mainAxisSpacing: responsive.paddingMedium,
              childAspectRatio: responsive.byDevice(
                mobile: 1.3,
                tablet: 1.4,
                desktop: 1.5,
              ),
              children: [
                _buildStatCard(
                  icon: Icons.event,
                  title: 'Events',
                  count: dashboardProvider.statistics.eventsCount,
                  color: AppColors.primaryBlue,
                  onTap: () => Navigator.of(context).pushNamed('/events'),
                ),
                _buildStatCard(
                  icon: Icons.people,
                  title: 'Members',
                  count: dashboardProvider.statistics.membersCount,
                  color: AppColors.success,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const MembersScreen()),
                  ),
                ),
                _buildStatCard(
                  icon: Icons.group,
                  title: 'Groups',
                  count: dashboardProvider.statistics.groupsCount,
                  color: AppColors.gold,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const GroupsScreen()),
                  ),
                ),
                _buildStatCard(
                  icon: Icons.family_restroom,
                  title: 'Families',
                  count: dashboardProvider.statistics.familiesCount,
                  color: AppColors.warning,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const FamiliesScreen()),
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required int count,
    required Color color,
    required VoidCallback onTap,
  }) {
    final responsive = ResponsiveSize(context);
    
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(responsive.radiusLarge),
      child: Container(
        padding: EdgeInsets.all(responsive.paddingMedium),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(responsive.radiusLarge),
          border: Border.all(
            color: AppColors.surfaceContainer,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: responsive.scale(8),
              offset: Offset(0, responsive.scale(4)),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: EdgeInsets.all(responsive.scale(10)),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(responsive.radiusMedium),
              ),
              child: Icon(
                icon,
                color: color,
                size: responsive.iconSizeMedium,
              ),
            ),
            SizedBox(height: responsive.paddingSmall),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                count.toString(),
                style: TextStyle(
                  fontSize: responsive.fontSizeXLarge,
                  fontWeight: FontWeight.bold,
                  color: AppColors.onSurface,
                ),
              ),
            ),
            SizedBox(height: responsive.scale(2)),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                title,
                style: TextStyle(
                  fontSize: responsive.fontSizeMedium,
                  color: AppColors.onSurfaceVariant,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionsSection() {
    final responsive = ResponsiveSize(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.onSurface,
            fontWeight: FontWeight.bold,
            fontSize: responsive.fontSizeXLarge,
          ),
        ),
        SizedBox(height: responsive.paddingMedium),
        Row(
          children: [
            Expanded(
              child: _buildActionCard(
                icon: Icons.qr_code_scanner,
                title: 'Scan Attendance',
                subtitle: 'Mark member attendance',
                color: AppColors.primaryBlue,
                onTap: () => Navigator.of(context).pushNamed('/events'),
              ),
            ),
            SizedBox(width: responsive.paddingMedium),
            Expanded(
              child: _buildActionCard(
                icon: Icons.person_add,
                title: 'Add Member',
                subtitle: 'Register new member',
                color: AppColors.success,
                onTap: () {
                  // TODO: Navigate to add member screen
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Add member feature coming soon'),
                      backgroundColor: AppColors.primaryBlue,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
        SizedBox(height: responsive.paddingMedium),
        Row(
          children: [
            Expanded(
              child: _buildActionCard(
                icon: Icons.event_available,
                title: 'Create Event',
                subtitle: 'Schedule new event',
                color: AppColors.gold,
                onTap: () {
                  // TODO: Navigate to create event screen
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Create event feature coming soon'),
                      backgroundColor: AppColors.primaryBlue,
                    ),
                  );
                },
              ),
            ),
            SizedBox(width: responsive.paddingMedium),
            Expanded(
              child: _buildActionCard(
                icon: Icons.analytics,
                title: 'Reports',
                subtitle: 'View analytics',
                color: AppColors.warning,
                onTap: () {
                  // TODO: Navigate to reports screen
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Reports feature coming soon'),
                      backgroundColor: AppColors.primaryBlue,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    final responsive = ResponsiveSize(context);
    
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(responsive.radiusLarge),
      child: Container(
        padding: EdgeInsets.all(responsive.paddingMedium),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(responsive.radiusLarge),
          border: Border.all(
            color: AppColors.surfaceContainer,
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: EdgeInsets.all(responsive.scale(8)),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(responsive.radiusSmall),
              ),
              child: Icon(
                icon,
                color: color,
                size: responsive.iconSizeSmall,
              ),
            ),
            SizedBox(height: responsive.paddingSmall),
            Text(
              title,
              style: TextStyle(
                fontSize: responsive.fontSizeMedium,
                fontWeight: FontWeight.bold,
                color: AppColors.onSurface,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            SizedBox(height: responsive.scale(2)),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: responsive.fontSizeSmall,
                color: AppColors.onSurfaceVariant,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivitySection() {
    final responsive = ResponsiveSize(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recent Activity',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.onSurface,
            fontWeight: FontWeight.bold,
            fontSize: responsive.fontSizeXLarge,
          ),
        ),
        SizedBox(height: responsive.paddingMedium),
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(responsive.paddingLarge),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(responsive.radiusLarge),
            border: Border.all(
              color: AppColors.surfaceContainer,
              width: 1,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.history,
                color: AppColors.onSurfaceVariant,
                size: responsive.iconSizeXLarge,
              ),
              SizedBox(height: responsive.paddingMedium),
              Text(
                'No recent activity',
                style: TextStyle(
                  fontSize: responsive.fontSizeLarge,
                  color: AppColors.onSurfaceVariant,
                  fontWeight: FontWeight.w500,
                ),
              ),
              SizedBox(height: responsive.scale(4)),
              Text(
                'Your recent actions will appear here',
                style: TextStyle(
                  fontSize: responsive.fontSizeMedium,
                  color: AppColors.onSurfaceVariant.withOpacity(0.7),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
