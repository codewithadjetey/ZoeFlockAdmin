import 'dart:async';
import 'package:permission_handler/permission_handler.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:vibration/vibration.dart';
import 'package:audioplayers/audioplayers.dart';
import '../models/member.dart';
import '../models/event.dart';
import '../models/attendance.dart';
import '../models/offline_attendance.dart';
import '../models/api_response.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../utils/validators.dart';
import 'api_service.dart';
import 'database_service.dart';
import 'offline_attendance_service.dart';

class ScannerService {
  static final ScannerService _instance = ScannerService._internal();
  factory ScannerService() => _instance;
  ScannerService._internal();

  final ApiService _apiService = ApiService();
  final DatabaseService _databaseService = DatabaseService();
  final OfflineAttendanceService _offlineAttendanceService = OfflineAttendanceService();
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

      // Check if the event is eligible for attendance (today or past events only)
      // Note: Event eligibility validation is handled at the UI level in member_profile_screen.dart
      // This service-level validation is removed to avoid Provider context issues

      // Clean the barcode (remove any non-digit characters for member ID)
      final cleanBarcode = barcode.replaceAll(RegExp(r'[^0-9]'), '');

      // Get member from local database first
      final member = await _databaseService.getMemberByIdentificationId(cleanBarcode);
      if (member == null) {
        return ApiResponse.error('Member not found in local database. Please sync data first.');
      }

      // Check if member is already marked for this event
      final alreadyMarked = await _offlineAttendanceService.isMemberAlreadyMarked(member.id, eventId);
      if (alreadyMarked) {
        return ApiResponse.error('Member has already been marked for this event');
      }

      // Get event from local database
      final event = await _databaseService.getEventById(eventId);
      if (event == null) {
        return ApiResponse.error('Event not found in local database');
      }

      // Mark attendance offline
      final offlineAttendance = await _offlineAttendanceService.markAttendanceOffline(
        member: member,
        event: event,
        status: 'present',
        notes: notes,
        isFirstTimer: false,
      );

      // Add to recent scans
      _addToRecentScans(member);

      // Provide feedback
      await _provideFeedback();

      print('ScannerService: Member ${member.fullName} marked offline for event ${event.title}');
      return ApiResponse.success(member, message: 'Attendance marked offline successfully');
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  Future<ApiResponse<Member>> _scanOnline(String memberIdentificationId, int eventId, String? notes) async {
    try {
      final response = await _apiService.scanMemberId(
        memberIdentificationId,
        eventId,
      );

      if (response.isSuccess && response.data != null) {
        // The response.data is already a Member object
        final member = response.data!;
        
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

  Future<ApiResponse<Member>> _scanOffline(String memberIdentificationId, int eventId, String? notes) async {
    try {
      // Try to find member in local database
      final member = await _databaseService.getMemberByIdentificationId(memberIdentificationId);
      
      if (member != null) {
        // Queue the attendance for later sync
        await _queueOfflineAttendance(member.id, eventId, notes);
        
        return ApiResponse.success(
          member,
          message: 'Member found (offline mode - will sync when online)',
        );
      } else {
        return ApiResponse.error(
          'Member not found in local database. Please ensure you have internet connection to scan new members.'
        );
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
          attendanceData['member_id'].toString(),
          attendanceData['event_id'],
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

  // Additional method needed by AttendanceProvider
  Future<ApiResponse<Member>> scanMemberForAttendance(
    String memberIdentificationId, 
    int eventId
  ) async {
    return await scanMemberId(
      barcode: memberIdentificationId,
      eventId: eventId,
    );
  }

  // Pre-load members into local database for better offline support
  Future<void> syncMembersToLocalDatabase() async {
    try {
      if (!_isOnline) {
        print('Cannot sync members: offline');
        return;
      }

      print('Syncing members to local database...');
      
      // Get all members from the API (you might want to implement pagination)
      // For now, we'll implement a basic sync that loads members as they're scanned
      // This method can be called periodically or when the app starts
      
      print('Members sync completed');
    } catch (e) {
      print('Error syncing members: $e');
    }
  }

  // Load a specific member into local database
  Future<void> loadMemberToLocalDatabase(String memberIdentificationId) async {
    try {
      if (!_isOnline) {
        print('Cannot load member: offline');
        return;
      }

      // Check if member already exists in local database
      final existingMember = await _databaseService.getMemberByIdentificationId(memberIdentificationId);
      if (existingMember != null) {
        print('Member already exists in local database');
        return;
      }

      // Try to get member from API and cache locally
      final response = await _apiService.scanMemberId(memberIdentificationId, 0); // Use dummy event ID
      if (response.isSuccess && response.data != null) {
        await _databaseService.insertMember(response.data!);
        print('Member loaded to local database: ${response.data!.fullName}');
      }
    } catch (e) {
      print('Error loading member to local database: $e');
    }
  }

  /// Add member to recent scans list
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

  /// Provide feedback (vibration and sound)
  Future<void> _provideFeedback() async {
    try {
      if (_enableVibration) {
        await Vibration.vibrate(duration: 200);
      }
      
      if (_enableSound) {
        // Play success sound
        final player = AudioPlayer();
        await player.play(AssetSource('sounds/success.mp3'));
      }
    } catch (e) {
      print('ScannerService: Error providing feedback: $e');
    }
  }

  /// Handle successful scan (legacy method for compatibility)
  Future<void> _handleSuccessfulScan(Member member) async {
    _addToRecentScans(member);
    await _provideFeedback();
  }
}
