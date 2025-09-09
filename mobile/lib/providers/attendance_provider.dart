import 'package:flutter/material.dart';
import '../models/member.dart';
import '../models/event.dart';
import '../models/attendance.dart';
import '../models/api_response.dart';
import '../services/api_service.dart';
import '../services/database_service.dart';
import '../services/scanner_service.dart';

class AttendanceProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final DatabaseService _databaseService = DatabaseService();
  final ScannerService _scannerService = ScannerService();
  
  bool _isLoading = false;
  List<Attendance> _attendance = [];
  List<Member> _recentScans = [];
  String? _errorMessage;
  bool _isOffline = false;
  Map<String, int> _statistics = {};

  bool get isLoading => _isLoading;
  List<Attendance> get attendance => List.unmodifiable(_attendance);
  List<Member> get recentScans => List.unmodifiable(_recentScans);
  String? get errorMessage => _errorMessage;
  bool get isOffline => _isOffline;
  Map<String, int> get statistics => Map.unmodifiable(_statistics);

  Future<void> initialize() async {
    await _scannerService.initialize();
    _recentScans = _scannerService.recentScans;
    _isOffline = !_scannerService.isOnline;
    await _loadStatistics();
  }

  Future<bool> requestCameraPermission() async {
    return await _scannerService.requestCameraPermission();
  }

  Future<ApiResponse<Member>> scanMemberId({
    required String barcode,
    required int eventId,
    String? notes,
  }) async {
    _setLoading(true);
    _clearError();
    
    try {
      final response = await _scannerService.scanMemberId(
        barcode: barcode,
        eventId: eventId,
        notes: notes,
      );
      
      if (response.isSuccess && response.data != null) {
        // Update recent scans
        _recentScans = _scannerService.recentScans;
        
        // Refresh attendance for the event
        await refreshEventAttendance(eventId);
        
        // Update statistics
        await _loadStatistics();
        
        _isOffline = !_scannerService.isOnline;
      } else {
        _setError(response.errorMessage);
      }
      
      return response;
    } catch (e) {
      final error = 'Scan failed: ${e.toString()}';
      _setError(error);
      return ApiResponse.error(error);
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refreshEventAttendance(int eventId) async {
    try {
      if (!_isOffline) {
        // Try to fetch from API
        final response = await _apiService.getEventAttendance(eventId);
        if (response.isSuccess && response.data != null) {
          _attendance = response.data!;
          _isOffline = false;
          
          // Cache in database
          await _databaseService.insertAttendanceList(_attendance);
        } else {
          // API failed, use cached data
          await _loadAttendanceFromDatabase(eventId);
          _isOffline = true;
        }
      } else {
        // Offline mode, use cached data
        await _loadAttendanceFromDatabase(eventId);
      }
    } catch (e) {
      await _loadAttendanceFromDatabase(eventId);
      _isOffline = true;
    }
  }

  Future<void> _loadAttendanceFromDatabase(int eventId) async {
    try {
      _attendance = await _databaseService.getAttendanceByEvent(eventId);
    } catch (e) {
      _attendance = [];
      _setError('Failed to load attendance from database');
    }
  }

  Future<void> loadEventAttendance(int eventId) async {
    _setLoading(true);
    await refreshEventAttendance(eventId);
    _setLoading(false);
  }

  Future<ApiResponse<Attendance>> updateAttendance({
    required int attendanceId,
    String? status,
    String? notes,
    bool? isFirstTimer,
  }) async {
    _setLoading(true);
    _clearError();
    
    try {
      final response = await _apiService.updateAttendance(
        attendanceId: attendanceId,
        status: status,
        notes: notes,
        isFirstTimer: isFirstTimer,
      );
      
      if (response.isSuccess && response.data != null) {
        // Update local attendance
        final index = _attendance.indexWhere((a) => a.id == attendanceId);
        if (index != -1) {
          _attendance[index] = response.data!;
          await _databaseService.updateAttendance(response.data!);
        }
        
        // Update statistics
        await _loadStatistics();
      } else {
        _setError(response.errorMessage);
      }
      
      return response;
    } catch (e) {
      final error = 'Update failed: ${e.toString()}';
      _setError(error);
      return ApiResponse.error(error);
    } finally {
      _setLoading(false);
    }
  }

  Future<List<Attendance>> getMemberAttendance(int memberId) async {
    try {
      return await _databaseService.getAttendanceByMember(memberId);
    } catch (e) {
      return [];
    }
  }

  Future<Attendance?> getMemberEventAttendance(int memberId, int eventId) async {
    try {
      return await _databaseService.getAttendanceByMemberAndEvent(memberId, eventId);
    } catch (e) {
      return null;
    }
  }

  Future<List<Member>> searchMembers(String query) async {
    try {
      return await _scannerService.searchMembers(query);
    } catch (e) {
      return [];
    }
  }

  Future<void> _loadStatistics() async {
    try {
      _statistics = await _scannerService.getScanStatistics();
    } catch (e) {
      _statistics = {
        'today_scans': 0,
        'total_scans': 0,
        'offline_pending': 0,
      };
    }
  }

  Future<void> refreshStatistics() async {
    await _loadStatistics();
    notifyListeners();
  }

  Future<void> clearRecentScans() async {
    _scannerService.clearRecentScans();
    _recentScans = [];
    notifyListeners();
  }

  Future<void> removeFromRecentScans(int memberId) async {
    _scannerService.removeFromRecentScans(memberId);
    _recentScans = _scannerService.recentScans;
    notifyListeners();
  }

  Future<List<Map<String, dynamic>>> getOfflineQueue() async {
    return _scannerService.getOfflineQueue();
  }

  Future<void> clearOfflineQueue() async {
    await _scannerService.clearOfflineQueue();
    await _loadStatistics();
    notifyListeners();
  }

  Future<int> getOfflineQueueCount() async {
    return await _scannerService.getOfflineQueueCount();
  }

  Future<void> processOfflineQueue() async {
    // This will be called automatically when connectivity is restored
    await _loadStatistics();
    notifyListeners();
  }

  // Scanner settings
  bool get enableVibration => _scannerService.enableVibration;
  bool get enableSound => _scannerService.enableSound;
  bool get enableFlash => _scannerService.enableFlash;
  bool get enableAutoFocus => _scannerService.enableAutoFocus;

  void setVibrationEnabled(bool enabled) {
    _scannerService.setVibrationEnabled(enabled);
  }

  void setSoundEnabled(bool enabled) {
    _scannerService.setSoundEnabled(enabled);
  }

  void setFlashEnabled(bool enabled) {
    _scannerService.setFlashEnabled(enabled);
  }

  void setAutoFocusEnabled(bool enabled) {
    _scannerService.setAutoFocusEnabled(enabled);
  }

  Future<void> provideErrorFeedback() async {
    await _scannerService.provideErrorFeedback();
  }

  // Filtering and searching
  List<Attendance> getAttendanceByStatus(String status) {
    return _attendance.where((a) => a.status.toLowerCase() == status.toLowerCase()).toList();
  }

  List<Attendance> getTodayAttendance() {
    final today = DateTime.now();
    final todayStart = DateTime(today.year, today.month, today.day);
    final todayEnd = todayStart.add(const Duration(days: 1));
    
    return _attendance.where((a) {
      return a.checkInTime.isAfter(todayStart) && a.checkInTime.isBefore(todayEnd);
    }).toList();
  }

  List<Attendance> getFirstTimers() {
    return _attendance.where((a) => a.isFirstTimer).toList();
  }

  // Export functionality
  Future<String> exportAttendanceToCsv() async {
    try {
      final csv = StringBuffer();
      csv.writeln('Member ID,Name,Email,Status,Check-in Time,Notes,First Timer');
      
      for (final attendance in _attendance) {
        // Get member details (this would need to be implemented)
        csv.writeln('${attendance.memberId},,,${attendance.status},${attendance.formattedCheckInTime},${attendance.notes ?? ""},${attendance.isFirstTimer}');
      }
      
      return csv.toString();
    } catch (e) {
      throw Exception('Failed to export attendance: ${e.toString()}');
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

  @override
  void dispose() {
    _scannerService.dispose();
    super.dispose();
  }
}
