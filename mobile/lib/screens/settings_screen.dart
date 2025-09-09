import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/attendance_provider.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../widgets/custom_app_bar.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _enableVibration = true;
  bool _enableSound = true;
  bool _enableFlash = false;
  bool _enableAutoFocus = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final attendanceProvider = Provider.of<AttendanceProvider>(context, listen: false);
    
    setState(() {
      _enableVibration = attendanceProvider.enableVibration;
      _enableSound = attendanceProvider.enableSound;
      _enableFlash = attendanceProvider.enableFlash;
      _enableAutoFocus = attendanceProvider.enableAutoFocus;
    });
  }

  Future<void> _saveSettings() async {
    final attendanceProvider = Provider.of<AttendanceProvider>(context, listen: false);
    
    attendanceProvider.setVibrationEnabled(_enableVibration);
    attendanceProvider.setSoundEnabled(_enableSound);
    attendanceProvider.setFlashEnabled(_enableFlash);
    attendanceProvider.setAutoFocusEnabled(_enableAutoFocus);
    
    AppHelpers.showSuccessSnackBar(context, 'Settings saved');
  }

  Future<void> _logout() async {
    final confirmed = await AppHelpers.showConfirmationDialog(
      context,
      title: 'Logout',
      content: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
    );
    
    if (confirmed == true) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.logout();
      
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/login');
      }
    }
  }

  Future<void> _clearData() async {
    final confirmed = await AppHelpers.showConfirmationDialog(
      context,
      title: 'Clear All Data',
      content: 'This will clear all cached data and offline records. Are you sure?',
      confirmText: 'Clear',
      cancelText: 'Cancel',
    );
    
    if (confirmed == true) {
      final attendanceProvider = Provider.of<AttendanceProvider>(context, listen: false);
      await attendanceProvider.clearOfflineQueue();
      
      if (mounted) {
        AppHelpers.showSuccessSnackBar(context, 'Data cleared successfully');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const CustomAppBar(
        title: AppStrings.settingsTitle,
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        children: [
          _buildScannerSettings(),
          const SizedBox(height: AppDimensions.paddingMedium),
          _buildDataSettings(),
          const SizedBox(height: AppDimensions.paddingMedium),
          _buildAccountSettings(),
          const SizedBox(height: AppDimensions.paddingMedium),
          _buildAppInfo(),
        ],
      ),
    );
  }

  Widget _buildScannerSettings() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Scanner Settings',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primaryBlue,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            
            _buildSwitchTile(
              title: 'Vibration Feedback',
              subtitle: 'Vibrate when QR code is scanned',
              value: _enableVibration,
              onChanged: (value) {
                setState(() {
                  _enableVibration = value;
                });
                _saveSettings();
              },
              icon: Icons.vibration,
            ),
            
            _buildSwitchTile(
              title: 'Sound Feedback',
              subtitle: 'Play sound when QR code is scanned',
              value: _enableSound,
              onChanged: (value) {
                setState(() {
                  _enableSound = value;
                });
                _saveSettings();
              },
              icon: Icons.volume_up,
            ),
            
            _buildSwitchTile(
              title: 'Flash Light',
              subtitle: 'Enable flash by default',
              value: _enableFlash,
              onChanged: (value) {
                setState(() {
                  _enableFlash = value;
                });
                _saveSettings();
              },
              icon: Icons.flash_on,
            ),
            
            _buildSwitchTile(
              title: 'Auto Focus',
              subtitle: 'Automatically focus camera',
              value: _enableAutoFocus,
              onChanged: (value) {
                setState(() {
                  _enableAutoFocus = value;
                });
                _saveSettings();
              },
              icon: Icons.center_focus_strong,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDataSettings() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Data Management',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primaryBlue,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            
            Consumer<AttendanceProvider>(
              builder: (context, attendanceProvider, child) {
                return ListTile(
                  leading: const Icon(Icons.offline_bolt, color: AppColors.warning),
                  title: const Text('Offline Records'),
                  subtitle: Text('${attendanceProvider.getOfflineQueueCount()} pending sync'),
                  trailing: const Icon(Icons.arrow_forward_ios),
                  onTap: () {
                    // TODO: Show offline queue details
                    AppHelpers.showInfoSnackBar(context, 'Offline queue details coming soon');
                  },
                );
              },
            ),
            
            ListTile(
              leading: const Icon(Icons.clear_all, color: AppColors.error),
              title: const Text('Clear All Data'),
              subtitle: const Text('Remove all cached data and offline records'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _clearData,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountSettings() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Account',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primaryBlue,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            
            Consumer<AuthProvider>(
              builder: (context, authProvider, child) {
                return ListTile(
                  leading: const Icon(Icons.person, color: AppColors.primaryBlue),
                  title: const Text('User Profile'),
                  subtitle: Text(authProvider.currentUser?.email ?? 'Not logged in'),
                  trailing: const Icon(Icons.arrow_forward_ios),
                  onTap: () {
                    // TODO: Show user profile
                    AppHelpers.showInfoSnackBar(context, 'User profile coming soon');
                  },
                );
              },
            ),
            
            ListTile(
              leading: const Icon(Icons.logout, color: AppColors.error),
              title: const Text('Logout'),
              subtitle: const Text('Sign out of your account'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _logout,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppInfo() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'App Information',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primaryBlue,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            
            _buildInfoRow('Version', '1.0.0'),
            _buildInfoRow('Build', '1'),
            _buildInfoRow('Platform', 'Flutter'),
            _buildInfoRow('Developer', 'Church Development Team'),
            
            const SizedBox(height: AppDimensions.paddingMedium),
            
            Center(
              child: Text(
                '© 2025 Church Attendance Scanner\nAll rights reserved',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.mediumGray,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    required IconData icon,
  }) {
    return SwitchListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      value: value,
      onChanged: onChanged,
      secondary: Icon(icon, color: AppColors.primaryBlue),
      activeColor: AppColors.primaryBlue,
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppDimensions.paddingSmall),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
                color: AppColors.mediumGray,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}
