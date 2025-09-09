import 'package:flutter/material.dart';
import '../models/member.dart';
import '../models/api_response.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  
  bool _isLoading = false;
  bool _isAuthenticated = false;
  Member? _currentUser;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  Member? get currentUser => _currentUser;
  String? get errorMessage => _errorMessage;

  Future<void> initialize() async {
    _setLoading(true);
    try {
      await _authService.initialize();
      _isAuthenticated = _authService.isAuthenticated;
      _currentUser = _authService.currentUser;
    } catch (e) {
      _setError('Failed to initialize authentication: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> login(String email, String password, {bool rememberMe = false}) async {
    _setLoading(true);
    _clearError();
    
    try {
      final response = await _authService.login(email, password, rememberMe: rememberMe);
      
      if (response.isSuccess && response.data != null) {
        _isAuthenticated = true;
        _currentUser = response.data;
        notifyListeners();
        return true;
      } else {
        _setError(response.errorMessage);
        return false;
      }
    } catch (e) {
      _setError('Login failed: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    _setLoading(true);
    
    try {
      await _authService.logout();
      _isAuthenticated = false;
      _currentUser = null;
      _clearError();
    } catch (e) {
      _setError('Logout failed: ${e.toString()}');
    } finally {
      _setLoading(false);
      notifyListeners();
    }
  }

  Future<String?> getStoredEmail() async {
    return await _authService.getStoredEmail();
  }

  Future<bool> getRememberMe() async {
    return await _authService.getRememberMe();
  }

  Future<void> clearRememberMe() async {
    await _authService.clearRememberMe();
  }

  Future<bool> isTokenValid() async {
    return await _authService.isTokenValid();
  }

  Future<void> refreshToken() async {
    await _authService.refreshToken();
    _isAuthenticated = _authService.isAuthenticated;
    _currentUser = _authService.currentUser;
    notifyListeners();
  }

  Future<void> updateUserProfile(Member user) async {
    _currentUser = user;
    await _authService.updateUserProfile(user);
    notifyListeners();
  }

  Future<int?> getLastEventId() async {
    return await _authService.getLastEventId();
  }

  Future<void> setLastEventId(int eventId) async {
    await _authService.setLastEventId(eventId);
  }

  Future<void> clearLastEventId() async {
    await _authService.clearLastEventId();
  }

  Future<Map<String, dynamic>> getAppSettings() async {
    return await _authService.getAppSettings();
  }

  Future<void> setAppSettings(Map<String, dynamic> settings) async {
    await _authService.setAppSettings(settings);
  }

  Future<void> clearAllData() async {
    await _authService.clearAllData();
    _isAuthenticated = false;
    _currentUser = null;
    _clearError();
    notifyListeners();
  }

  void updateLastActivity() {
    _authService.updateLastActivity();
  }

  Future<void> checkAutoLogout() async {
    await _authService.checkAutoLogout();
    if (!_isAuthenticated) {
      notifyListeners();
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void clearError() {
    _clearError();
  }
}
