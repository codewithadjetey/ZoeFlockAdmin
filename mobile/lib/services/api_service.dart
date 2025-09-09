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
    try {
      print('ApiService: Initializing Dio...');
      _dio = Dio(BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: ApiConstants.timeout,
        receiveTimeout: ApiConstants.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ));
      print('ApiService: Dio initialized successfully');

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
      print('ApiService: Interceptors added successfully');
    } catch (e) {
      print('ApiService: Error during initialization: $e');
      rethrow;
    }
  }

  void setTokens(String accessToken, String? refreshToken) {
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
      print('ApiService: Making login request to ${ApiConstants.loginEndpoint}');
      final response = await _dio.post(
        ApiConstants.loginEndpoint,
        data: {
          'email': email,
          'password': password,
        },
      );

      print('ApiService: Login response received - Status: ${response.statusCode}');
      print('ApiService: Response data: ${response.data}');

      if (response.statusCode == 200) {
        print('ApiService: Parsing login response...');
        final loginResponse = LoginResponse.fromJson(response.data);
        print('ApiService: Login response parsed successfully');
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
      print('ApiService: Login error caught: $e');
      print('ApiService: Error type: ${e.runtimeType}');
      print('ApiService: Stack trace: ${StackTrace.current}');
      
      // Handle DioError specifically to extract backend error messages
      if (e is DioException) {
        final statusCode = e.response?.statusCode;
        final responseData = e.response?.data;
        
        print('Login API Error - Status: $statusCode, Data: $responseData');
        
        // Extract error message from backend response
        String errorMessage = 'Login failed';
        
        if (responseData is Map<String, dynamic>) {
          // Try to get message from response
          if (responseData.containsKey('message')) {
            errorMessage = responseData['message'].toString();
          } else if (responseData.containsKey('error')) {
            errorMessage = responseData['error'].toString();
          } else if (responseData.containsKey('errors')) {
            final errors = responseData['errors'];
            if (errors is Map<String, dynamic>) {
              // Get first error message
              final firstError = errors.values.first;
              if (firstError is List && firstError.isNotEmpty) {
                errorMessage = firstError.first.toString();
              } else if (firstError is String) {
                errorMessage = firstError;
              }
            }
          }
        }
        
        // Handle specific status codes
        if (statusCode == 401) {
          errorMessage = 'Invalid email or password';
        } else if (statusCode == 422) {
          errorMessage = 'Invalid input data';
        } else if (statusCode == 429) {
          errorMessage = 'Too many login attempts. Please try again later';
        } else if (statusCode == 500) {
          errorMessage = 'Server error. Please try again later';
        }
        
        return ApiResponse.error(
          errorMessage,
          statusCode: statusCode,
        );
      }
      
      // Handle other types of errors
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
