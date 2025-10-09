import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/user_config_service.dart';
import '../utils/constants.dart';
import '../utils/responsive_size.dart';
import '../screens/members_screen.dart';
import '../screens/first_timers_screen.dart';
import '../screens/visitors_screen.dart';
import '../screens/groups_screen.dart';
import '../screens/families_screen.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.surface,
      width: ResponsiveSize(context).byDevice(
        mobile: ResponsiveSize(context).wp(75),
        tablet: ResponsiveSize(context).wp(60),
        desktop: 300,
      ),
      child: Column(
        children: [
          _buildUserHeader(context),
          _buildMenuItems(context),
          const Spacer(),
          _buildFooter(context),
        ],
      ),
    );
  }

  Widget _buildUserHeader(BuildContext context) {
    final userConfigService = UserConfigService();
    final responsive = ResponsiveSize(context);
    
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(
        responsive.paddingMedium,
        responsive.paddingLarge + MediaQuery.of(context).padding.top,
        responsive.paddingMedium,
        responsive.paddingMedium,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primaryBlue,
            AppColors.primaryBlue.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Avatar
          CircleAvatar(
            radius: responsive.scale(38),
            backgroundColor: AppColors.white,
            child: Text(
              userConfigService.userInitials,
              style: TextStyle(
                fontSize: responsive.fontSizeXLarge,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryBlue,
              ),
            ),
          ),
          SizedBox(height: responsive.paddingMedium),
          
          // User name
          Text(
            userConfigService.userFullName,
            style: TextStyle(
              fontSize: responsive.fontSizeLarge,
              fontWeight: FontWeight.bold,
              color: AppColors.white,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          SizedBox(height: responsive.paddingSmall),
          
          // User email
          Text(
            userConfigService.userEmail,
            style: TextStyle(
              fontSize: responsive.fontSizeMedium,
              color: AppColors.white.withOpacity(0.8),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItems(BuildContext context) {
    final responsive = ResponsiveSize(context);
    
    final menuItems = [
      DrawerMenuItem(
        icon: Icons.dashboard,
        title: 'Dashboard',
        route: '/dashboard',
      ),
      DrawerMenuItem(
        icon: Icons.event,
        title: 'Events',
        route: '/events',
      ),
      DrawerMenuItem(
        icon: Icons.people,
        title: 'Members',
        route: '/members',
      ),
      DrawerMenuItem(
        icon: Icons.person_add,
        title: 'First Timers',
        route: '/first-timers',
      ),
      DrawerMenuItem(
        icon: Icons.visibility,
        title: 'Visitors',
        route: '/visitors',
      ),
      DrawerMenuItem(
        icon: Icons.group,
        title: 'Groups',
        route: '/groups',
      ),
      DrawerMenuItem(
        icon: Icons.family_restroom,
        title: 'Families',
        route: '/families',
      ),
    ];

    return Expanded(
      child: ListView.builder(
        padding: EdgeInsets.symmetric(vertical: responsive.paddingSmall),
        itemCount: menuItems.length,
        itemBuilder: (context, index) {
          final item = menuItems[index];
          return _buildMenuItem(context, item);
        },
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, DrawerMenuItem item) {
    final responsive = ResponsiveSize(context);
    
    return ListTile(
      leading: Icon(
        item.icon,
        color: AppColors.onSurface,
        size: responsive.iconSizeMedium,
      ),
      title: Text(
        item.title,
        style: TextStyle(
          color: AppColors.onSurface,
          fontSize: responsive.fontSizeMedium,
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      onTap: () {
        Navigator.of(context).pop(); // Close drawer
        _navigateToRoute(context, item.route);
      },
      hoverColor: AppColors.surfaceContainer,
    );
  }

  Widget _buildFooter(BuildContext context) {
    final responsive = ResponsiveSize(context);
    
    return Container(
      padding: EdgeInsets.all(responsive.paddingMedium),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Divider(color: AppColors.onSurfaceVariant),
          ListTile(
            leading: Icon(
              Icons.settings,
              color: AppColors.onSurface,
              size: responsive.iconSizeMedium,
            ),
            title: Text(
              'Settings',
              style: TextStyle(
                color: AppColors.onSurface,
                fontSize: responsive.fontSizeMedium,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            onTap: () {
              Navigator.of(context).pop(); // Close drawer
              Navigator.of(context).pushNamed('/settings');
            },
          ),
          ListTile(
            leading: Icon(
              Icons.logout,
              color: AppColors.error,
              size: responsive.iconSizeMedium,
            ),
            title: Text(
              'Logout',
              style: TextStyle(
                color: AppColors.error,
                fontSize: responsive.fontSizeMedium,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            onTap: () => _showLogoutDialog(context),
          ),
        ],
      ),
    );
  }

  void _navigateToRoute(BuildContext context, String route) {
    switch (route) {
      case '/events':
        Navigator.of(context).pushNamed('/events');
        break;
      case '/dashboard':
        Navigator.of(context).pushNamed('/dashboard');
        break;
      case '/members':
        Navigator.of(context).push(
          MaterialPageRoute(builder: (context) => const MembersScreen()),
        );
        break;
      case '/first-timers':
        Navigator.of(context).push(
          MaterialPageRoute(builder: (context) => const FirstTimersScreen()),
        );
        break;
      case '/visitors':
        Navigator.of(context).push(
          MaterialPageRoute(builder: (context) => const VisitorsScreen()),
        );
        break;
      case '/groups':
        Navigator.of(context).push(
          MaterialPageRoute(builder: (context) => const GroupsScreen()),
        );
        break;
      case '/families':
        Navigator.of(context).push(
          MaterialPageRoute(builder: (context) => const FamiliesScreen()),
        );
        break;
      default:
        Navigator.of(context).pushNamed('/dashboard');
    }
  }


  void _showLogoutDialog(BuildContext context) {
    final responsive = ResponsiveSize(context);
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: AppColors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(responsive.radiusLarge),
          ),
          title: Text(
            'Logout',
            style: TextStyle(
              color: AppColors.onSurface,
              fontSize: responsive.fontSizeXLarge,
            ),
          ),
          content: Text(
            'Are you sure you want to logout?',
            style: TextStyle(
              color: AppColors.onSurface,
              fontSize: responsive.fontSizeMedium,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Cancel',
                style: TextStyle(
                  color: AppColors.onSurfaceVariant,
                  fontSize: responsive.fontSizeMedium,
                ),
              ),
            ),
            TextButton(
              onPressed: () async {
                Navigator.of(context).pop(); // Close dialog
                Navigator.of(context).pop(); // Close drawer
                
                final authProvider = Provider.of<AuthProvider>(context, listen: false);
                await authProvider.logout();
                
                if (context.mounted) {
                  Navigator.of(context).pushReplacementNamed('/login');
                }
              },
              child: Text(
                'Logout',
                style: TextStyle(
                  color: AppColors.error,
                  fontSize: responsive.fontSizeMedium,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

}

class DrawerMenuItem {
  final IconData icon;
  final String title;
  final String route;

  DrawerMenuItem({
    required this.icon,
    required this.title,
    required this.route,
  });
}
