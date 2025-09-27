import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/member.dart';
import '../utils/constants.dart';

class UserConfigService {
  static final UserConfigService _instance = UserConfigService._internal();
  factory UserConfigService() => _instance;
  UserConfigService._internal();

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

  SharedPreferences? _prefs;

  // Cached user information
  Member? _cachedUser;
  String? _cachedToken;

  /// Initialize the user config service
  Future<void> initialize() async {
    try {
      _prefs = await SharedPreferences.getInstance();
      await _loadCachedUserInfo();
      print('UserConfigService: Initialized successfully');
    } catch (e) {
      print('UserConfigService: Error during initialization: $e');
    }
  }

  /// Load cached user information from storage
  Future<void> _loadCachedUserInfo() async {
    try {
      // Load token
      _cachedToken = await _secureStorage.read(key: StorageKeys.authToken);
      
      // Load user information
      final userId = await _getStoredValue(StorageKeys.userId);
      final firstName = await _getStoredValue(StorageKeys.userFirstName);
      final lastName = await _getStoredValue(StorageKeys.userLastName);
      final email = await _getStoredValue(StorageKeys.userEmail);
      
      if (userId != null && firstName != null && lastName != null && email != null) {
        _cachedUser = Member(
          id: int.parse(userId),
          firstName: firstName,
          lastName: lastName,
          email: email,
          profileImagePath: await _getStoredValue(StorageKeys.userProfileImage),
          memberIdentificationId: await _getStoredValue(StorageKeys.userMemberId) ?? '',
          group: await _getStoredValue(StorageKeys.userGroup),
          family: await _getStoredValue(StorageKeys.userFamily),
          gender: await _getStoredValue(StorageKeys.userGender),
          phone: await _getStoredValue(StorageKeys.userPhone),
          dateOfBirth: await _getStoredDateValue(StorageKeys.userDateOfBirth),
          status: await _getStoredValue(StorageKeys.userStatus) ?? 'inactive',
          createdAt: await _getStoredDateValue(StorageKeys.userCreatedAt) ?? DateTime.now(),
          updatedAt: await _getStoredDateValue(StorageKeys.userUpdatedAt) ?? DateTime.now(),
        );
        print('UserConfigService: Cached user info loaded - ${_cachedUser?.fullName}');
      }
    } catch (e) {
      print('UserConfigService: Error loading cached user info: $e');
    }
  }

  /// Store user information after successful login
  Future<void> storeUserInfo({
    required Member user,
    required String token,
    String? refreshToken,
  }) async {
    try {
      // Store token securely
      await _secureStorage.write(key: StorageKeys.authToken, value: token);
      if (refreshToken != null) {
        await _secureStorage.write(key: StorageKeys.refreshToken, value: refreshToken);
      }

      // Store user information
      await _storeValue(StorageKeys.userId, user.id.toString());
      await _storeValue(StorageKeys.userFirstName, user.firstName);
      await _storeValue(StorageKeys.userLastName, user.lastName);
      await _storeValue(StorageKeys.userEmail, user.email);
      await _storeValue(StorageKeys.userProfileImage, user.profileImagePath);
      await _storeValue(StorageKeys.userMemberId, user.memberIdentificationId);
      await _storeValue(StorageKeys.userGroup, user.group);
      await _storeValue(StorageKeys.userFamily, user.family);
      await _storeValue(StorageKeys.userGender, user.gender);
      await _storeValue(StorageKeys.userPhone, user.phone);
      await _storeValue(StorageKeys.userStatus, user.status);
      await _storeDateValue(StorageKeys.userDateOfBirth, user.dateOfBirth);
      await _storeDateValue(StorageKeys.userCreatedAt, user.createdAt);
      await _storeDateValue(StorageKeys.userUpdatedAt, user.updatedAt);

      // Update cache
      _cachedUser = user;
      _cachedToken = token;

      print('UserConfigService: User info stored successfully - ${user.fullName}');
    } catch (e) {
      print('UserConfigService: Error storing user info: $e');
    }
  }

  /// Get current user information
  Member? get currentUser => _cachedUser;

  /// Get current auth token
  String? get currentToken => _cachedToken;

  /// Get user's full name
  String get userFullName => _cachedUser?.fullName ?? 'User';

  /// Get user's email
  String get userEmail => _cachedUser?.email ?? '';

  /// Get user's initials for avatar
  String get userInitials => _cachedUser?.initials ?? 'U';

  /// Check if user is authenticated
  bool get isAuthenticated => _cachedToken != null && _cachedToken!.isNotEmpty && _cachedUser != null;

  /// Update user profile information
  Future<void> updateUserProfile(Member updatedUser) async {
    try {
      await storeUserInfo(
        user: updatedUser,
        token: _cachedToken ?? '',
      );
      print('UserConfigService: User profile updated - ${updatedUser.fullName}');
    } catch (e) {
      print('UserConfigService: Error updating user profile: $e');
    }
  }

  /// Clear all stored user information
  Future<void> clearUserInfo() async {
    try {
      // Clear secure storage
      await _secureStorage.delete(key: StorageKeys.authToken);
      await _secureStorage.delete(key: StorageKeys.refreshToken);

      // Clear user information
      final keysToRemove = [
        StorageKeys.userId,
        StorageKeys.userFirstName,
        StorageKeys.userLastName,
        StorageKeys.userEmail,
        StorageKeys.userProfileImage,
        StorageKeys.userMemberId,
        StorageKeys.userGroup,
        StorageKeys.userFamily,
        StorageKeys.userGender,
        StorageKeys.userPhone,
        StorageKeys.userStatus,
        StorageKeys.userDateOfBirth,
        StorageKeys.userCreatedAt,
        StorageKeys.userUpdatedAt,
      ];

      for (final key in keysToRemove) {
        await _removeValue(key);
      }

      // Clear cache
      _cachedUser = null;
      _cachedToken = null;

      print('UserConfigService: All user info cleared');
    } catch (e) {
      print('UserConfigService: Error clearing user info: $e');
    }
  }

  /// Get stored value from secure storage or SharedPreferences
  Future<String?> _getStoredValue(String key) async {
    try {
      // Try secure storage first
      String? value = await _secureStorage.read(key: key);
      if (value != null && value.isNotEmpty) {
        return value;
      }
    } catch (e) {
      print('UserConfigService: Error reading from secure storage for key $key: $e');
    }

    // Fallback to SharedPreferences
    return _prefs?.getString(key);
  }

  /// Store value in secure storage or SharedPreferences
  Future<void> _storeValue(String key, String? value) async {
    if (value == null || value.isEmpty) return;

    try {
      // Try secure storage first
      await _secureStorage.write(key: key, value: value);
    } catch (e) {
      print('UserConfigService: Error writing to secure storage for key $key: $e');
      // Fallback to SharedPreferences
      await _prefs?.setString(key, value);
    }
  }

  /// Store date value
  Future<void> _storeDateValue(String key, DateTime? date) async {
    if (date == null) return;
    await _storeValue(key, date.millisecondsSinceEpoch.toString());
  }

  /// Get stored date value
  Future<DateTime?> _getStoredDateValue(String key) async {
    final value = await _getStoredValue(key);
    if (value == null || value.isEmpty) return null;
    
    try {
      return DateTime.fromMillisecondsSinceEpoch(int.parse(value));
    } catch (e) {
      print('UserConfigService: Error parsing date for key $key: $e');
      return null;
    }
  }

  /// Remove stored value
  Future<void> _removeValue(String key) async {
    try {
      await _secureStorage.delete(key: key);
    } catch (e) {
      print('UserConfigService: Error removing from secure storage for key $key: $e');
    }
    await _prefs?.remove(key);
  }

  /// Get user info as Map for debugging
  Map<String, dynamic> getUserInfoMap() {
    return {
      'isAuthenticated': isAuthenticated,
      'userFullName': userFullName,
      'userEmail': userEmail,
      'userInitials': userInitials,
      'hasToken': _cachedToken != null,
      'tokenLength': _cachedToken?.length ?? 0,
      'user': _cachedUser?.toJson(),
    };
  }
}
