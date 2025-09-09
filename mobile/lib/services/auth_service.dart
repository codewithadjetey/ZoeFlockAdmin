import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/api_response.dart';
import '../models/member.dart';
import 'api_service.dart';
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
  );

  final ApiService _apiService = ApiService();
  SharedPreferences? _prefs;

  bool _isAuthenticated = false;
  Member? _currentUser;

  bool get isAuthenticated => _isAuthenticated;
  Member? get currentUser => _currentUser;

  Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
    await _loadStoredCredentials();
  }

  Future<void> _loadStoredCredentials() async {
    try {
      final accessToken = await _secureStorage.read(key: StorageKeys.authToken);
      final refreshToken = await _secureStorage.read(key: StorageKeys.refreshToken);
      
      if (accessToken != null && refreshToken != null) {
        _apiService.setTokens(accessToken, refreshToken);
        _isAuthenticated = true;
        
        // Try to validate the token by making a test request
        final response = await _apiService.healthCheck();
        if (!response.isSuccess) {
          // Token is invalid, clear stored credentials
          await logout();
        }
      }
    } catch (e) {
      // Error loading credentials, clear them
      await logout();
    }
  }

  Future<ApiResponse<Member>> login(String email, String password, {bool rememberMe = false}) async {
    try {
      final response = await _apiService.login(email, password);
      
      if (response.isSuccess && response.data != null) {
        final loginResponse = response.data!;
        
        // Store tokens securely
        await _secureStorage.write(key: StorageKeys.authToken, value: loginResponse.accessToken);
        await _secureStorage.write(key: StorageKeys.refreshToken, value: loginResponse.refreshToken);
        
        // Store user email if remember me is checked
        if (rememberMe) {
          await _prefs?.setString(StorageKeys.userEmail, email);
          await _prefs?.setBool(StorageKeys.rememberMe, true);
        }
        
        _isAuthenticated = true;
        
        // Create a basic user object from the login response
        _currentUser = Member(
          id: loginResponse.user['id'] ?? 0,
          firstName: loginResponse.user['first_name'] ?? '',
          lastName: loginResponse.user['last_name'] ?? '',
          email: loginResponse.user['email'] ?? email,
          memberIdentificationId: loginResponse.user['member_identification_id'] ?? '',
          status: loginResponse.user['status'] ?? 'active',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        
        return ApiResponse.success(
          _currentUser!,
          message: 'Login successful',
        );
      } else {
        return ApiResponse.error(response.errorMessage);
      }
    } catch (e) {
      return ApiResponse.error('Login failed: ${e.toString()}');
    }
  }

  Future<ApiResponse<void>> logout() async {
    try {
      // Call API logout if authenticated
      if (_isAuthenticated) {
        await _apiService.logout();
      }
      
      // Clear stored credentials
      await _secureStorage.delete(key: StorageKeys.authToken);
      await _secureStorage.delete(key: StorageKeys.refreshToken);
      
      // Clear user data
      _isAuthenticated = false;
      _currentUser = null;
      _apiService.clearTokens();
      
      return ApiResponse.success(null, message: 'Logout successful');
    } catch (e) {
      // Even if API logout fails, clear local data
      await _secureStorage.delete(key: StorageKeys.authToken);
      await _secureStorage.delete(key: StorageKeys.refreshToken);
      _isAuthenticated = false;
      _currentUser = null;
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
    if (!_isAuthenticated) return false;
    
    try {
      final response = await _apiService.healthCheck();
      return response.isSuccess;
    } catch (e) {
      return false;
    }
  }

  Future<void> refreshToken() async {
    if (!_isAuthenticated) return;
    
    try {
      final accessToken = await _secureStorage.read(key: StorageKeys.authToken);
      final refreshToken = await _secureStorage.read(key: StorageKeys.refreshToken);
      
      if (accessToken != null && refreshToken != null) {
        _apiService.setTokens(accessToken, refreshToken);
        
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
    _currentUser = user;
  }

  Future<Map<String, dynamic>> getAuthHeaders() async {
    final accessToken = await _secureStorage.read(key: StorageKeys.authToken);
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
    await _secureStorage.deleteAll();
    await _prefs?.clear();
    _isAuthenticated = false;
    _currentUser = null;
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
