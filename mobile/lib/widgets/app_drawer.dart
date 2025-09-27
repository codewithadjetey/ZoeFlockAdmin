import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/user_config_service.dart';
import '../utils/constants.dart';
import '../screens/members_screen.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.surface,
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
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(
        AppDimensions.paddingMedium,
        AppDimensions.paddingLarge,
        AppDimensions.paddingMedium,
        AppDimensions.paddingMedium,
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
        children: [
          // Avatar
          CircleAvatar(
            radius: 40,
            backgroundColor: AppColors.white,
            child: Text(
              userConfigService.userInitials,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryBlue,
              ),
            ),
          ),
          const SizedBox(height: AppDimensions.paddingMedium),
          
          // User name
          Text(
            userConfigService.userFullName,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.white,
            ),
          ),
          const SizedBox(height: AppDimensions.paddingSmall),
          
          // User email
          Text(
            userConfigService.userEmail,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.white.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItems(BuildContext context) {
    final menuItems = [
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
        padding: const EdgeInsets.symmetric(vertical: AppDimensions.paddingSmall),
        itemCount: menuItems.length,
        itemBuilder: (context, index) {
          final item = menuItems[index];
          return _buildMenuItem(context, item);
        },
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, DrawerMenuItem item) {
    return ListTile(
      leading: Icon(
        item.icon,
        color: AppColors.onSurface,
      ),
      title: Text(
        item.title,
        style: const TextStyle(
          color: AppColors.onSurface,
          fontSize: 16,
        ),
      ),
      onTap: () {
        Navigator.of(context).pop(); // Close drawer
        _navigateToRoute(context, item.route);
      },
      hoverColor: AppColors.surfaceContainer,
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.paddingMedium),
      child: Column(
        children: [
          const Divider(color: AppColors.onSurfaceVariant),
          ListTile(
            leading: const Icon(
              Icons.settings,
              color: AppColors.onSurface,
            ),
            title: const Text(
              'Settings',
              style: TextStyle(
                color: AppColors.onSurface,
                fontSize: 16,
              ),
            ),
            onTap: () {
              Navigator.of(context).pop(); // Close drawer
              Navigator.of(context).pushNamed('/settings');
            },
          ),
          ListTile(
            leading: const Icon(
              Icons.logout,
              color: AppColors.error,
            ),
            title: const Text(
              'Logout',
              style: TextStyle(
                color: AppColors.error,
                fontSize: 16,
              ),
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
      case '/members':
        Navigator.of(context).push(
          MaterialPageRoute(builder: (context) => const MembersScreen()),
        );
        break;
      case '/first-timers':
        _showComingSoon(context, 'First Timers');
        break;
      case '/visitors':
        _showComingSoon(context, 'Visitors');
        break;
      case '/groups':
        _showComingSoon(context, 'Groups');
        break;
      case '/families':
        _showComingSoon(context, 'Families');
        break;
      default:
        Navigator.of(context).pushNamed('/events');
    }
  }

  void _showComingSoon(BuildContext context, String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$feature feature coming soon!'),
        backgroundColor: AppColors.primaryBlue,
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: AppColors.surface,
          title: const Text(
            'Logout',
            style: TextStyle(color: AppColors.onSurface),
          ),
          content: const Text(
            'Are you sure you want to logout?',
            style: TextStyle(color: AppColors.onSurface),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text(
                'Cancel',
                style: TextStyle(color: AppColors.onSurfaceVariant),
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
              child: const Text(
                'Logout',
                style: TextStyle(color: AppColors.error),
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
