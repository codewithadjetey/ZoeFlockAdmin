import 'dart:async';
import 'package:permission_handler/permission_handler.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:vibration/vibration.dart';
import 'package:audioplayers/audioplayers.dart';
import '../models/member.dart';
import '../models/event.dart';
import '../models/attendance.dart';
import '../models/api_response.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../utils/validators.dart';
import 'api_service.dart';
import 'database_service.dart';

class ScannerService {
  static final ScannerService _instance = ScannerService._internal();
  factory ScannerService() => _instance;
  ScannerService._internal();

  final ApiService _apiService = ApiService();
  final DatabaseService _databaseService = DatabaseService();
  final Connectivity _connectivity = Connectivity();
  
  StreamSubscription<ConnectivityResult>? _connectivitySubscription;
  bool _isOnline = true;
  
  // Scanner settings
  bool _enableVibration = AppSettings.enableVibration;
  bool _enableSound = AppSettings.enableSound;
  bool _enableFlash = AppSettings.enableFlash;
  bool _enableAutoFocus = AppSettings.enableAutoFocus;

  // Recent scans cache
  final List<Member> _recentScans = [];
  final int _maxRecentScans = AppSettings.maxRecentScans;

  // Offline queue
  final List<Map<String, dynamic>> _offlineQueue = [];

  bool get isOnline => _isOnline;
  bool get enableVibration => _enableVibration;
  bool get enableSound => _enableSound;
  bool get enableFlash => _enableFlash;
  bool get enableAutoFocus => _enableAutoFocus;
  List<Member> get recentScans => List.unmodifiable(_recentScans);

  Future<void> initialize() async {
    // Check connectivity
    await _checkConnectivity();
    
    // Listen to connectivity changes
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
      (ConnectivityResult result) {
        _isOnline = result != ConnectivityResult.none;
        _processOfflineQueue();
      },
    );
    
    // Load settings
    await _loadSettings();
  }

  Future<void> _loadSettings() async {
    // Load scanner settings from database or shared preferences
    // This would typically load from a settings table or SharedPreferences
    // For now, using default values
  }

  Future<void> _checkConnectivity() async {
    final result = await _connectivity.checkConnectivity();
    _isOnline = result != ConnectivityResult.none;
  }

  Future<bool> requestCameraPermission() async {
    final status = await Permission.camera.request();
    return status == PermissionStatus.granted;
  }

  Future<bool> hasCameraPermission() async {
    final status = await Permission.camera.status;
    return status == PermissionStatus.granted;
  }

  Future<ApiResponse<Member>> scanMemberId({
    required String barcode,
    required int eventId,
    String? notes,
  }) async {
    try {
      // Validate the barcode
      final validationError = Validators.validateQRCode(barcode);
      if (validationError != null) {
        return ApiResponse.error(validationError);
      }

      // Clean the barcode (remove any non-digit characters for member ID)
      final cleanBarcode = barcode.replaceAll(RegExp(r'[^0-9]'), '');

      if (_isOnline) {
        // Try online scan first
        final response = await _scanOnline(cleanBarcode, eventId, notes);
        if (response.isSuccess) {
          await _handleSuccessfulScan(response.data!);
          return response;
        } else {
          // If online scan fails, try offline
          return await _scanOffline(cleanBarcode, eventId, notes);
        }
      } else {
        // Offline scan
        return await _scanOffline(cleanBarcode, eventId, notes);
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  Future<ApiResponse<Member>> _scanOnline(String barcode, int eventId, String? notes) async {
    try {
      final response = await _apiService.scanMemberId(
        barcode: barcode,
        eventId: eventId,
        notes: notes,
      );

      if (response.isSuccess && response.data != null) {
        // Extract member data from the scan response
        final memberData = response.data!.member;
        final member = Member.fromJson(memberData);
        
        // Cache the member locally
        await _databaseService.insertMember(member);
        
        return ApiResponse.success(member, message: response.message);
      } else {
        return ApiResponse.error(response.errorMessage);
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  Future<ApiResponse<Member>> _scanOffline(String barcode, int eventId, String? notes) async {
    try {
      // Try to find member in local database
      final member = await _databaseService.getMemberByIdentificationId(barcode);
      
      if (member != null) {
        // Queue the attendance for later sync
        await _queueOfflineAttendance(member.id, eventId, notes);
        
        return ApiResponse.success(
          member,
          message: 'Member found (offline mode - will sync when online)',
        );
      } else {
        return ApiResponse.error('Member not found in local database');
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  Future<void> _queueOfflineAttendance(int memberId, int eventId, String? notes) async {
    final attendanceData = {
      'member_id': memberId,
      'event_id': eventId,
      'status': 'present',
      'check_in_time': DateTime.now().millisecondsSinceEpoch,
      'notes': notes ?? '',
      'is_first_timer': false,
      'created_at': DateTime.now().millisecondsSinceEpoch,
      'updated_at': DateTime.now().millisecondsSinceEpoch,
    };
    
    _offlineQueue.add(attendanceData);
    
    // Store in local database for persistence
    final attendance = Attendance(
      id: DateTime.now().millisecondsSinceEpoch, // Temporary ID
      memberId: memberId,
      eventId: eventId,
      status: 'present',
      checkInTime: DateTime.now(),
      notes: notes,
      isFirstTimer: false,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    
    await _databaseService.insertAttendance(attendance);
  }

  Future<void> _processOfflineQueue() async {
    if (!_isOnline || _offlineQueue.isEmpty) return;
    
    try {
      for (final attendanceData in List.from(_offlineQueue)) {
        final response = await _apiService.scanMemberId(
          barcode: attendanceData['member_id'].toString(),
          eventId: attendanceData['event_id'],
          notes: attendanceData['notes'],
        );
        
        if (response.isSuccess) {
          _offlineQueue.remove(attendanceData);
        }
      }
    } catch (e) {
      // Error processing offline queue, will retry later
    }
  }

  Future<void> _handleSuccessfulScan(Member member) async {
    // Add to recent scans
    _addToRecentScans(member);
    
    // Provide feedback
    await _provideFeedback();
  }

  void _addToRecentScans(Member member) {
    // Remove if already exists
    _recentScans.removeWhere((m) => m.id == member.id);
    
    // Add to beginning
    _recentScans.insert(0, member);
    
    // Keep only max recent scans
    if (_recentScans.length > _maxRecentScans) {
      _recentScans.removeRange(_maxRecentScans, _recentScans.length);
    }
  }

  Future<void> _provideFeedback() async {
    if (_enableVibration) {
      await AppHelpers.vibrate();
    }
    
    if (_enableSound) {
      await AppHelpers.playSuccessSound();
    }
  }

  Future<void> provideErrorFeedback() async {
    if (_enableVibration) {
      await AppHelpers.vibrate();
    }
    
    if (_enableSound) {
      await AppHelpers.playErrorSound();
    }
  }

  // Settings management
  void setVibrationEnabled(bool enabled) {
    _enableVibration = enabled;
  }

  void setSoundEnabled(bool enabled) {
    _enableSound = enabled;
  }

  void setFlashEnabled(bool enabled) {
    _enableFlash = enabled;
  }

  void setAutoFocusEnabled(bool enabled) {
    _enableAutoFocus = enabled;
  }

  // Recent scans management
  void clearRecentScans() {
    _recentScans.clear();
  }

  void removeFromRecentScans(int memberId) {
    _recentScans.removeWhere((member) => member.id == memberId);
  }

  // Offline queue management
  List<Map<String, dynamic>> getOfflineQueue() {
    return List.unmodifiable(_offlineQueue);
  }

  Future<void> clearOfflineQueue() async {
    _offlineQueue.clear();
    // Also clear from database
    await _databaseService.clearAllData();
  }

  Future<int> getOfflineQueueCount() async {
    return _offlineQueue.length;
  }

  // Member search
  Future<List<Member>> searchMembers(String query) async {
    try {
      if (query.isEmpty) return [];
      
      final allMembers = await _databaseService.getAllMembers();
      
      return allMembers.where((member) {
        final fullName = member.fullName.toLowerCase();
        final email = member.email.toLowerCase();
        final memberId = member.memberIdentificationId.toLowerCase();
        final searchQuery = query.toLowerCase();
        
        return fullName.contains(searchQuery) ||
               email.contains(searchQuery) ||
               memberId.contains(searchQuery);
      }).toList();
    } catch (e) {
      return [];
    }
  }

  // Statistics
  Future<Map<String, int>> getScanStatistics() async {
    try {
      final allAttendance = await _databaseService.getAllAttendance();
      final today = DateTime.now();
      final todayStart = DateTime(today.year, today.month, today.day);
      final todayEnd = todayStart.add(const Duration(days: 1));
      
      final todayScans = allAttendance.where((attendance) {
        return attendance.checkInTime.isAfter(todayStart) &&
               attendance.checkInTime.isBefore(todayEnd);
      }).length;
      
      final totalScans = allAttendance.length;
      
      return {
        'today_scans': todayScans,
        'total_scans': totalScans,
        'offline_pending': _offlineQueue.length,
      };
    } catch (e) {
      return {
        'today_scans': 0,
        'total_scans': 0,
        'offline_pending': _offlineQueue.length,
      };
    }
  }

  Future<void> dispose() async {
    await _connectivitySubscription?.cancel();
  }
}
