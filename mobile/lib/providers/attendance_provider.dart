import 'package:flutter/foundation.dart';
import '../models/api_response.dart';
import '../models/attendance.dart';
import '../models/member.dart';
import '../models/event.dart';
import '../services/api_service.dart';
import '../services/database_service.dart';
import '../services/scanner_service.dart';

class AttendanceProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final DatabaseService _databaseService = DatabaseService();
  final ScannerService _scannerService = ScannerService();

  List<Attendance> _attendance = [];
  bool _isLoading = false;
  String? _error;
  bool _isOffline = false;

  // Statistics
  int _totalAttendance = 0;
  int _presentCount = 0;
  int _absentCount = 0;
  int _firstTimers = 0;
  double _attendanceRate = 0.0;

  // Getters
  List<Attendance> get attendance => _attendance;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isOffline => _isOffline;
  int get totalAttendance => _totalAttendance;
  int get presentCount => _presentCount;
  int get absentCount => _absentCount;
  int get firstTimers => _firstTimers;
  double get attendanceRate => _attendanceRate;

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }

  Future<void> loadAttendance(int eventId) async {
    _setLoading(true);
    _clearError();
    
    try {
      // Try to load from API first
      final attendance = await _loadAttendanceFromNetwork(eventId);
      if (attendance != null) {
        _attendance = attendance;
        _isOffline = false;
        
        // Cache in database
        await _databaseService.insertAttendanceList(attendance);
      } else {
        // Fallback to local database
        _attendance = await _databaseService.getAttendanceByEvent(eventId);
        _isOffline = true;
      }
      
      await _loadStatistics();
    } catch (e) {
      _setError('Failed to load attendance: ${e.toString()}');
      // Try to load from local database
      try {
        _attendance = await _databaseService.getAttendanceByEvent(eventId);
        _isOffline = true;
      } catch (dbError) {
        debugPrint('Failed to load from database: $dbError');
      }
    } finally {
      _setLoading(false);
    }
  }

  Future<List<Attendance>?> _loadAttendanceFromNetwork(int eventId) async {
    try {
      // Note: This endpoint might not exist yet, so we'll comment it out for now
      // final response = await _apiService.getEventAttendance(eventId);
      // 
      // if (response.isSuccess && response.data != null) {
      //   return response.data!;
      // }
      return null;
    } catch (e) {
      debugPrint('Network error loading attendance: $e');
      return null;
    }
  }

  Future<ApiResponse<Attendance>> markAttendance({
    required int memberId,
    required int eventId,
    String status = 'present',
    String? notes,
    bool isFirstTimer = false,
  }) async {
    _setLoading(true);
    _clearError();
    
    try {
      final response = await _apiService.markAttendance(
        memberId,
        eventId,
        status: status,
        notes: notes,
        isFirstTimer: isFirstTimer,
      );
      
      if (response.isSuccess && response.data != null) {
        // Add to local list
        _attendance.add(response.data!);
        
        // Cache in database
        await _databaseService.insertAttendance(response.data!);
        
        // Update statistics
        await _loadStatistics();
      } else {
        _setError(response.errorMessage);
      }
      
      return response;
    } catch (e) {
      final errorMessage = 'Failed to mark attendance: ${e.toString()}';
      _setError(errorMessage);
      return ApiResponse.error(errorMessage);
    } finally {
      _setLoading(false);
    }
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
      // Note: updateAttendance API endpoint doesn't exist yet, so we'll simulate it locally
      // final response = await _apiService.updateAttendance(
      //   attendanceId: attendanceId,
      //   status: status,
      //   notes: notes,
      //   isFirstTimer: isFirstTimer,
      // );
      
      // For now, just update locally
      final index = _attendance.indexWhere((a) => a.id == attendanceId);
      if (index != -1) {
        final updatedAttendance = _attendance[index].copyWith(
          status: status,
          notes: notes,
          isFirstTimer: isFirstTimer,
        );
        _attendance[index] = updatedAttendance;
        await _databaseService.updateAttendance(updatedAttendance);
        
        // Update statistics
        await _loadStatistics();
        
        return ApiResponse.success(updatedAttendance, message: 'Attendance updated successfully');
      } else {
        final errorMessage = 'Attendance record not found';
        _setError(errorMessage);
        return ApiResponse.error(errorMessage);
      }
    } catch (e) {
      final errorMessage = 'Failed to update attendance: ${e.toString()}';
      _setError(errorMessage);
      return ApiResponse.error(errorMessage);
    } finally {
      _setLoading(false);
    }
  }

  Future<ApiResponse<Member>> scanMemberForAttendance(
    String memberIdentificationId, 
    int eventId
  ) async {
    _setLoading(true);
    _clearError();
    
    try {
      final response = await _scannerService.scanMemberForAttendance(
        memberIdentificationId, 
        eventId
      );
      
      if (!response.isSuccess) {
        _setError(response.errorMessage);
      }
      
      return response;
    } catch (e) {
      final errorMessage = 'Failed to scan member: ${e.toString()}';
      _setError(errorMessage);
      return ApiResponse.error(errorMessage);
    } finally {
      _setLoading(false);
    }
  }

  Future<void> _loadStatistics() async {
    _totalAttendance = _attendance.length;
    _presentCount = _attendance.where((a) => a.status == 'present').length;
    _absentCount = _attendance.where((a) => a.status == 'absent').length;
    _firstTimers = _attendance.where((a) => a.isFirstTimer).length;
    
    if (_totalAttendance > 0) {
      _attendanceRate = (_presentCount / _totalAttendance) * 100;
    } else {
      _attendanceRate = 0.0;
    }
    
    notifyListeners();
  }

  void clearAttendance() {
    _attendance.clear();
    _totalAttendance = 0;
    _presentCount = 0;
    _absentCount = 0;
    _firstTimers = 0;
    _attendanceRate = 0.0;
    _isOffline = false;
    _clearError();
    notifyListeners();
  }

  void clearError() {
    _clearError();
    notifyListeners();
  }

  Future<void> syncOfflineData() async {
    if (!_isOffline) return;
    
    _setLoading(true);
    _clearError();
    
    try {
      // Get offline attendance records
      final offlineAttendance = await _databaseService.getAllAttendance();
      
      for (final attendance in offlineAttendance) {
        try {
          final response = await _apiService.markAttendance(
            attendance.memberId,
            attendance.eventId,
            status: attendance.status,
            notes: attendance.notes,
            isFirstTimer: attendance.isFirstTimer,
          );
          
          if (response.isSuccess) {
            // Mark as synced in database - we'll implement this later
            // await _databaseService.markAttendanceSynced(attendance.id);
          }
        } catch (e) {
          debugPrint('Failed to sync attendance ${attendance.id}: $e');
        }
      }
      
      _isOffline = false;
    } catch (e) {
      _setError('Failed to sync offline data: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Missing methods that are called from UI
  Future<bool> requestCameraPermission() async {
    return await _scannerService.requestCameraPermission();
  }

  Future<ApiResponse<Member>> scanMemberId({
    required String barcode,
    required int eventId,
    String? notes,
  }) async {
    return await _scannerService.scanMemberId(
      barcode: barcode,
      eventId: eventId,
      notes: notes,
    );
  }

  List<Member> get recentScans => _scannerService.recentScans;

  // Settings getters
  bool get enableVibration => _scannerService.enableVibration;
  bool get enableSound => _scannerService.enableSound;
  bool get enableFlash => _scannerService.enableFlash;
  bool get enableAutoFocus => _scannerService.enableAutoFocus;

  // Settings setters
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

  Future<void> clearOfflineQueue() async {
    await _scannerService.clearOfflineQueue();
  }

  Future<int> getOfflineQueueCount() async {
    return await _scannerService.getOfflineQueueCount();
  }
}
