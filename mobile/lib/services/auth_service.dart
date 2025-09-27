import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/api_response.dart';
import '../models/member.dart';
import 'api_service.dart';
import 'user_config_service.dart';
import '../utils/constants.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
    webOptions: WebOptions(
      dbName: "church_attendance_scanner",
      publicKey: "church_attendance_scanner_public_key",
    ),
  );

  final ApiService _apiService = ApiService();
  final UserConfigService _userConfigService = UserConfigService();
  SharedPreferences? _prefs;

  bool get isAuthenticated => _userConfigService.isAuthenticated;
  Member? get currentUser => _userConfigService.currentUser;

  Future<void> initialize() async {
    try {
      print('AuthService: Starting initialization...');
      _prefs = await SharedPreferences.getInstance();
      print('AuthService: SharedPreferences initialized');
      
      // Initialize user config service
      await _userConfigService.initialize();
      print('AuthService: UserConfigService initialized');
      
      _apiService.initialize(); // Initialize the API service
      print('AuthService: ApiService initialized');
      
      await _loadStoredCredentials();
      print('AuthService: Stored credentials loaded');
    } catch (e) {
      print('AuthService: Error during initialization: $e');
      rethrow;
    }
  }

  Future<void> _loadStoredCredentials() async {
    try {
      // Check if user config service has valid user info
      if (_userConfigService.isAuthenticated) {
        final token = _userConfigService.currentToken;
        if (token != null && token.isNotEmpty) {
          _apiService.setTokens(token, null);
          
          // Try to validate the token by making a test request
          final response = await _apiService.healthCheck();
          if (!response.isSuccess) {
            // Token is invalid, clear stored credentials
            print('AuthService: Token validation failed, clearing credentials');
            await logout();
          } else {
            print('AuthService: Token validation successful');
          }
        }
      } else {
        print('AuthService: No valid user configuration found');
      }
    } catch (e) {
      // Error loading credentials, clear them
      print('AuthService: Error loading credentials: $e');
      await logout();
    }
  }

  Future<ApiResponse<Member>> login(String email, String password, {bool rememberMe = false}) async {
    try {
      print('AuthService: Starting login for email: $email');
      final response = await _apiService.login(email, password);
      
      if (response.isSuccess && response.data != null) {
        final loginResponse = response.data!;
        print('AuthService: Login response received successfully');
        print('AuthService: User data: ${loginResponse.user}');
        
        // Create user object from login response
        print('AuthService: Creating Member object from user data');
        final user = Member(
          id: loginResponse.user['id'] ?? 0,
          firstName: loginResponse.user['name']?.split(' ').first ?? loginResponse.user['first_name'] ?? '',
          lastName: loginResponse.user['name']?.split(' ').skip(1).join(' ') ?? loginResponse.user['last_name'] ?? '',
          email: loginResponse.user['email'] ?? email,
          memberIdentificationId: loginResponse.user['member_identification_id'] ?? '',
          status: loginResponse.user['is_active'] == true ? 'active' : 'inactive',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        print('AuthService: Member object created successfully');
        
        // Store user information using UserConfigService
        await _userConfigService.storeUserInfo(
          user: user,
          token: loginResponse.accessToken,
          refreshToken: loginResponse.refreshToken,
        );
        print('AuthService: User info stored in UserConfigService');
        
        // Set tokens in ApiService for immediate use
        _apiService.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
        print('AuthService: Tokens set in ApiService');
        
        // Store remember me preference
        if (rememberMe) {
          await _prefs?.setString(StorageKeys.userEmail, email);
          await _prefs?.setBool(StorageKeys.rememberMe, true);
        }
        
        return ApiResponse.success(
          user,
          message: 'Login successful',
        );
      } else {
        print('AuthService: Login failed: ${response.errorMessage}');
        return ApiResponse.error(response.errorMessage);
      }
    } catch (e) {
      print('AuthService: Login error: $e');
      print('AuthService: Stack trace: ${StackTrace.current}');
      return ApiResponse.error('Login failed: ${e.toString()}');
    }
  }

  Future<ApiResponse<void>> logout() async {
    try {
      // Call API logout if authenticated
      if (isAuthenticated) {
        await _apiService.logout();
      }
      
      // Clear all user information using UserConfigService
      await _userConfigService.clearUserInfo();
      
      // Clear API tokens
      _apiService.clearTokens();
      
      return ApiResponse.success(null, message: 'Logout successful');
    } catch (e) {
      // Even if API logout fails, clear local data
      await _userConfigService.clearUserInfo();
      _apiService.clearTokens();
      
      return ApiResponse.success(null, message: 'Logout successful');
    }
  }

  Future<String?> getStoredEmail() async {
    return await _prefs?.getString(StorageKeys.userEmail);
  }

  Future<bool> getRememberMe() async {
    return await _prefs?.getBool(StorageKeys.rememberMe) ?? false;
  }

  Future<void> clearRememberMe() async {
    await _prefs?.remove(StorageKeys.userEmail);
    await _prefs?.setBool(StorageKeys.rememberMe, false);
  }

  Future<bool> isTokenValid() async {
    if (!isAuthenticated) return false;
    
    try {
      final response = await _apiService.healthCheck();
      return response.isSuccess;
    } catch (e) {
      return false;
    }
  }

  Future<void> refreshToken() async {
    if (!isAuthenticated) return;
    
    try {
      final token = _userConfigService.currentToken;
      if (token != null) {
        _apiService.setTokens(token, null);
        
        // Test the token
        final response = await _apiService.healthCheck();
        if (!response.isSuccess) {
          await logout();
        }
      } else {
        await logout();
      }
    } catch (e) {
      await logout();
    }
  }

  Future<void> updateUserProfile(Member user) async {
    await _userConfigService.updateUserProfile(user);
  }

  Future<Map<String, dynamic>> getAuthHeaders() async {
    final accessToken = _userConfigService.currentToken;
    return {
      'Authorization': 'Bearer $accessToken',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  Future<void> setLastEventId(int eventId) async {
    await _prefs?.setInt(StorageKeys.lastEventId, eventId);
  }

  Future<int?> getLastEventId() async {
    return await _prefs?.getInt(StorageKeys.lastEventId);
  }

  Future<void> clearLastEventId() async {
    await _prefs?.remove(StorageKeys.lastEventId);
  }

  Future<void> setAppSettings(Map<String, dynamic> settings) async {
    final settingsJson = settings.toString();
    await _prefs?.setString(StorageKeys.settings, settingsJson);
  }

  Future<Map<String, dynamic>> getAppSettings() async {
    final settingsString = await _prefs?.getString(StorageKeys.settings);
    if (settingsString != null && settingsString.isNotEmpty) {
      try {
        // Parse the settings string back to Map
        // This is a simple implementation - you might want to use JSON encoding
        return {};
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  Future<void> clearAllData() async {
    await _userConfigService.clearUserInfo();
    await _prefs?.clear();
    _apiService.clearTokens();
  }

  // Auto-logout functionality
  DateTime? _lastActivity;
  
  void updateLastActivity() {
    _lastActivity = DateTime.now();
  }
  
  bool shouldAutoLogout() {
    if (_lastActivity == null) return false;
    
    final now = DateTime.now();
    final difference = now.difference(_lastActivity!);
    
    return difference > AppSettings.autoLogoutDuration;
  }
  
  Future<void> checkAutoLogout() async {
    if (shouldAutoLogout()) {
      await logout();
    }
  }
}
