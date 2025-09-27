import 'package:shared_preferences/shared_preferences.dart';

class DomainConfigService {
  static const String _domainKey = 'custom_domain';
  static const String _defaultDomain = '192.168.100.2';
  
  static String _currentDomain = _defaultDomain;
  
  /// Get the current domain
  static String get currentDomain => _currentDomain;
  
  /// Get the full API base URL
  static String get baseUrl => 'http://$_currentDomain/api/v1';
  
  /// Initialize the service and load saved domain
  static Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    _currentDomain = prefs.getString(_domainKey) ?? _defaultDomain;
  }
  
  /// Save a new domain
  static Future<bool> setDomain(String domain) async {
    try {
      // Validate domain format
      if (!_isValidDomain(domain)) {
        return false;
      }
      
      final prefs = await SharedPreferences.getInstance();
      final success = await prefs.setString(_domainKey, domain);
      
      if (success) {
        _currentDomain = domain;
      }
      
      return success;
    } catch (e) {
      return false;
    }
  }
  
  /// Reset to default domain
  static Future<bool> resetToDefault() async {
    return await setDomain(_defaultDomain);
  }
  
  /// Validate domain format
  static bool _isValidDomain(String domain) {
    if (domain.isEmpty) return false;
    
    // Basic domain validation regex
    final domainRegex = RegExp(
      r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$'
    );
    
    return domainRegex.hasMatch(domain);
  }
  
  /// Check if using custom domain
  static bool get isUsingCustomDomain => _currentDomain != _defaultDomain;
}


