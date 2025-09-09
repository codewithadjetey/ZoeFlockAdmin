import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:dio/dio.dart';
import '../models/api_response.dart';
import '../models/member.dart';
import '../models/event.dart';
import '../models/attendance.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late Dio _dio;
  String? _accessToken;
  String? _refreshToken;

  void initialize() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: ApiConstants.timeout,
      receiveTimeout: ApiConstants.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add interceptors
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        if (_accessToken != null) {
          options.headers['Authorization'] = 'Bearer $_accessToken';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Try to refresh token
          final refreshed = await _refreshAccessToken();
          if (refreshed) {
            // Retry the original request
            final options = error.requestOptions;
            options.headers['Authorization'] = 'Bearer $_accessToken';
            try {
              final response = await _dio.fetch(options);
              handler.resolve(response);
              return;
            } catch (e) {
              // Refresh failed, continue with error
            }
          }
        }
        handler.next(error);
      },
    ));
  }

  void setTokens(String accessToken, String refreshToken) {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
  }

  void clearTokens() {
    _accessToken = null;
    _refreshToken = null;
  }

  Future<bool> _refreshAccessToken() async {
    if (_refreshToken == null) return false;

    try {
      final response = await _dio.post(
        ApiConstants.refreshEndpoint,
        data: {'refresh_token': _refreshToken},
      );

      if (response.statusCode == 200) {
        final data = response.data;
        _accessToken = data['access_token'];
        _refreshToken = data['refresh_token'];
        return true;
      }
    } catch (e) {
      // Refresh failed
    }
    return false;
  }

  // Authentication endpoints
  Future<ApiResponse<LoginResponse>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        ApiConstants.loginEndpoint,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final loginResponse = LoginResponse.fromJson(response.data);
        setTokens(loginResponse.accessToken, loginResponse.refreshToken);
        
        return ApiResponse.success(
          loginResponse,
          message: 'Login successful',
          statusCode: response.statusCode,
        );
      } else {
        return ApiResponse.error(
          'Login failed',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  Future<ApiResponse<void>> logout() async {
    try {
      await _dio.post('/auth/logout');
      clearTokens();
      return ApiResponse.success(null, message: 'Logout successful');
    } catch (e) {
      clearTokens();
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  // Events endpoints
  Future<ApiResponse<List<Event>>> getEvents() async {
    try {
      final response = await _dio.get(ApiConstants.eventsEndpoint);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        final events = data.map((json) => Event.fromJson(json)).toList();
        
        return ApiResponse.success(
          events,
          message: 'Events retrieved successfully',
          statusCode: response.statusCode,
        );
      } else {
        return ApiResponse.error(
          'Failed to fetch events',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  Future<ApiResponse<Event>> getEvent(int eventId) async {
    try {
      final response = await _dio.get('${ApiConstants.eventsEndpoint}/$eventId');

      if (response.statusCode == 200) {
        final event = Event.fromJson(response.data['data'] ?? response.data);
        
        return ApiResponse.success(
          event,
          message: 'Event retrieved successfully',
          statusCode: response.statusCode,
        );
      } else {
        return ApiResponse.error(
          'Failed to fetch event',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  // Members endpoints
  Future<ApiResponse<Member>> getMember(int memberId) async {
    try {
      final response = await _dio.get('${ApiConstants.memberEndpoint}/$memberId');

      if (response.statusCode == 200) {
        final member = Member.fromJson(response.data['data'] ?? response.data);
        
        return ApiResponse.success(
          member,
          message: 'Member retrieved successfully',
          statusCode: response.statusCode,
        );
      } else {
        return ApiResponse.error(
          'Failed to fetch member',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  Future<ApiResponse<Member>> getMemberByIdentificationId(String memberId) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.memberEndpoint}/by-identification/$memberId',
      );

      if (response.statusCode == 200) {
        final member = Member.fromJson(response.data['data'] ?? response.data);
        
        return ApiResponse.success(
          member,
          message: 'Member retrieved successfully',
          statusCode: response.statusCode,
        );
      } else {
        return ApiResponse.error(
          'Member not found',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  // Attendance endpoints
  Future<ApiResponse<ScanMemberResponse>> scanMemberId({
    required String barcode,
    required int eventId,
    String? notes,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.scanMemberEndpoint,
        data: {
          'barcode': barcode,
          'event_id': eventId,
          'notes': notes,
        },
      );

      if (response.statusCode == 200) {
        final scanResponse = ScanMemberResponse.fromJson(response.data['data'] ?? response.data);
        
        return ApiResponse.success(
          scanResponse,
          message: 'Attendance marked successfully',
          statusCode: response.statusCode,
        );
      } else {
        return ApiResponse.error(
          response.data['message'] ?? 'Failed to mark attendance',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  Future<ApiResponse<List<Attendance>>> getEventAttendance(int eventId) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.eventsEndpoint}/$eventId/attendance',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        final attendance = data.map((json) => Attendance.fromJson(json)).toList();
        
        return ApiResponse.success(
          attendance,
          message: 'Attendance retrieved successfully',
          statusCode: response.statusCode,
        );
      } else {
        return ApiResponse.error(
          'Failed to fetch attendance',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  Future<ApiResponse<Attendance>> updateAttendance({
    required int attendanceId,
    String? status,
    String? notes,
    bool? isFirstTimer,
  }) async {
    try {
      final response = await _dio.put(
        '/attendance/$attendanceId',
        data: {
          if (status != null) 'status': status,
          if (notes != null) 'notes': notes,
          if (isFirstTimer != null) 'is_first_timer': isFirstTimer,
        },
      );

      if (response.statusCode == 200) {
        final attendance = Attendance.fromJson(response.data['data'] ?? response.data);
        
        return ApiResponse.success(
          attendance,
          message: 'Attendance updated successfully',
          statusCode: response.statusCode,
        );
      } else {
        return ApiResponse.error(
          'Failed to update attendance',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  // Health check
  Future<ApiResponse<void>> healthCheck() async {
    try {
      final response = await _dio.get('/health');
      
      if (response.statusCode == 200) {
        return ApiResponse.success(null, message: 'API is healthy');
      } else {
        return ApiResponse.error('API health check failed');
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }
}
