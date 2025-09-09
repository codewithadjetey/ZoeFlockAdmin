import 'package:flutter/material.dart';

class AppColors {
  static const Color primaryBlue = Color(0xFF3b82f6);
  static const Color gold = Color(0xFFf59e0b);
  static const Color white = Color(0xFFffffff);
  
  // Dark theme colors
  static const Color background = Color(0xFF121212);
  static const Color surface = Color(0xFF1a1a1a);
  static const Color surfaceContainer = Color(0xFF2a2a2a);
  static const Color surfaceContainerHigh = Color(0xFF3a3a3a);
  static const Color onSurface = Color(0xFFffffff);
  static const Color onSurfaceVariant = Color(0xFFb3b3b3);
  
  // Legacy colors for compatibility
  static const Color lightGray = Color(0xFF2a2a2a);
  static const Color mediumGray = Color(0xFF9ca3af);
  static const Color darkGray = Color(0xFF6b7280);
  
  static const Color success = Color(0xFF10b981);
  static const Color error = Color(0xFFef4444);
  static const Color warning = Color(0xFFf59e0b);
}

class AppStrings {
  static const String appName = 'Church Attendance Scanner';
  static const String loginTitle = 'Usher Login';
  static const String eventSelectionTitle = 'Select Event';
  static const String scannerTitle = 'Scan QR Code';
  static const String memberProfileTitle = 'Member Profile';
  static const String settingsTitle = 'Settings';
  
  // Login
  static const String emailHint = 'Enter your email';
  static const String passwordHint = 'Enter your password';
  static const String loginButton = 'Login';
  static const String rememberMe = 'Remember me';
  static const String forgotPassword = 'Forgot Password?';
  
  // Scanner
  static const String scanInstruction = 'Point camera at QR code';
  static const String manualEntryHint = 'Or enter member ID manually';
  static const String flashToggle = 'Flash';
  static const String cameraSwitch = 'Switch Camera';
  static const String recentScans = 'Recent Scans';
  
  // Member Profile
  static const String markPresent = 'Mark Present';
  static const String addNotes = 'Add Notes';
  static const String cancel = 'Cancel';
  static const String successMessage = 'Attendance marked successfully!';
  
  // Events
  static const String noEvents = 'No events available';
  static const String refreshEvents = 'Refresh Events';
  static const String attendanceCount = 'Attendance Count';
  
  // Errors
  static const String networkError = 'Network connection error';
  static const String invalidQR = 'Invalid QR code';
  static const String memberNotFound = 'Member not found';
  static const String loginError = 'Login failed';
  static const String cameraPermissionDenied = 'Camera permission denied';
  static const String offlineMode = 'Offline Mode';
}

class AppDimensions {
  static const double paddingSmall = 8.0;
  static const double paddingMedium = 16.0;
  static const double paddingLarge = 24.0;
  static const double paddingXLarge = 32.0;
  
  static const double radiusSmall = 4.0;
  static const double radiusMedium = 8.0;
  static const double radiusLarge = 12.0;
  static const double radiusXLarge = 16.0;
  
  static const double iconSizeSmall = 16.0;
  static const double iconSizeMedium = 24.0;
  static const double iconSizeLarge = 32.0;
  static const double iconSizeXLarge = 48.0;
}

class ApiConstants {
  static const String baseUrl = 'https://your-domain.com/api/v1';
  static const String loginEndpoint = '/auth/login';
  static const String refreshEndpoint = '/auth/refresh';
  static const String eventsEndpoint = '/events';
  static const String scanMemberEndpoint = '/attendance/scan-member-id';
  static const String memberEndpoint = '/members';
  
  static const Duration timeout = Duration(seconds: 30);
  static const Duration refreshTimeout = Duration(seconds: 10);
}

class DatabaseConstants {
  static const String databaseName = 'church_attendance.db';
  static const int databaseVersion = 1;
  
  static const String membersTable = 'members';
  static const String eventsTable = 'events';
  static const String attendanceTable = 'attendance';
  static const String settingsTable = 'settings';
}

class StorageKeys {
  static const String authToken = 'auth_token';
  static const String refreshToken = 'refresh_token';
  static const String userEmail = 'user_email';
  static const String rememberMe = 'remember_me';
  static const String lastEventId = 'last_event_id';
  static const String settings = 'app_settings';
}

class AppSettings {
  static const bool enableVibration = true;
  static const bool enableSound = true;
  static const bool enableFlash = false;
  static const bool enableAutoFocus = true;
  static const Duration autoLogoutDuration = Duration(minutes: 30);
  static const int maxRecentScans = 5;
  static const int maxOfflineRecords = 1000;
}
