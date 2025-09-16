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
          print('ApiService: Request interceptor - Access token: $_accessToken');
          if (_accessToken != null) {
            options.headers['Authorization'] = 'Bearer $_accessToken';
            print('ApiService: Authorization header added: Bearer $_accessToken');
          } else {
            print('ApiService: No access token available, skipping Authorization header');
          }
          print('ApiService: Request headers: ${options.headers}');
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
    print('ApiService: Setting tokens - Access token: $accessToken');
    print('ApiService: Setting tokens - Refresh token: $refreshToken');
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    print('ApiService: Tokens set successfully');
  }

  void clearTokens() {
    print('ApiService: Clearing tokens');
    _accessToken = null;
    _refreshToken = null;
    print('ApiService: Tokens cleared');
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
        print('ApiService: Response data structure: ${response.data}');
        print('ApiService: Response data type: ${response.data.runtimeType}');
        print('ApiService: Response data keys: ${response.data is Map ? (response.data as Map).keys.toList() : 'Not a Map'}');
        
        // Extract the data field from the response which contains the actual login data
        final responseData = response.data;
        final loginData = responseData['data'] as Map<String, dynamic>?;
        
        print('ApiService: Extracted data for parsing: $responseData');
        print('ApiService: Extracted data type: ${responseData.runtimeType}');
        print('ApiService: Extracted data keys: ${responseData is Map ? (responseData as Map).keys.toList() : 'Not a Map'}');
        print('ApiService: Login data: $loginData');
        
        if (loginData == null) {
          throw Exception('Invalid login response: missing data field');
        }
        
        final loginResponse = LoginResponse.fromJson(loginData);
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
            // Handle validation errors
            final errors = responseData['errors'];
            if (errors is Map) {
              final firstError = errors.values.first;
              if (firstError is List && firstError.isNotEmpty) {
                errorMessage = firstError.first.toString();
              } else if (firstError is String) {
                errorMessage = firstError;
              }
            }
          }
        }
        
        return ApiResponse.error(
          errorMessage,
          statusCode: statusCode,
        );
      } else {
        return ApiResponse.error('An error occurred: ${e.toString()}');
      }
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

  // Event endpoints
  Future<ApiResponse<List<Event>>> getEvents() async {
    try {
      final response = await _dio.get(ApiConstants.eventsEndpoint);

      if (response.statusCode == 200) {
        print('ApiService: Events response received - Status: ${response.statusCode}');
        print('ApiService: Events response data: ${response.data}');
        
        // Handle paginated response structure
        final responseData = response.data;
        final paginatedData = responseData['data'] as Map<String, dynamic>?;
        
        if (paginatedData == null) {
          throw Exception('Invalid events response: missing data field');
        }
        
        final eventsList = paginatedData['data'] as List?;
        if (eventsList == null) {
          throw Exception('Invalid events response: missing events array');
        }
        
        final events = eventsList
            .map((json) => Event.fromJson(json))
            .toList();
        
        print('ApiService: Parsed ${events.length} events');
        return ApiResponse.success(events);
      } else {
        return ApiResponse.error('Failed to fetch events');
      }
    } catch (e) {
      print('ApiService: Events error: $e');
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  Future<ApiResponse<Event>> getEvent(int id) async {
    try {
      final response = await _dio.get('${ApiConstants.eventsEndpoint}/$id');
      
      if (response.statusCode == 200) {
        print('ApiService: Single event response received - Status: ${response.statusCode}');
        print('ApiService: Single event response data: ${response.data}');
        
        // Handle single event response structure
        final responseData = response.data;
        final eventData = responseData['data'] as Map<String, dynamic>?;
        
        if (eventData == null) {
          throw Exception('Invalid event response: missing data field');
        }
        
        final event = Event.fromJson(eventData);
        return ApiResponse.success(event);
      } else {
        return ApiResponse.error('Failed to fetch event');
      }
    } catch (e) {
      print('ApiService: Single event error: $e');
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  // Member endpoints
  Future<ApiResponse<Member>> getMember(int id) async {
    try {
      final response = await _dio.get('${ApiConstants.memberEndpoint}/$id');
      
      if (response.statusCode == 200) {
        print('ApiService: Member response received - Status: ${response.statusCode}');
        print('ApiService: Member response data: ${response.data}');
        
        // Handle member response structure
        final responseData = response.data;
        final memberData = responseData['data'] as Map<String, dynamic>?;
        
        if (memberData == null) {
          throw Exception('Invalid member response: missing data field');
        }
        
        final member = Member.fromJson(memberData);
        return ApiResponse.success(member);
      } else {
        return ApiResponse.error('Failed to fetch member');
      }
    } catch (e) {
      print('ApiService: Member error: $e');
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  // Attendance endpoints
  Future<ApiResponse<Attendance>> markAttendance(int memberId, int eventId, {
    String status = 'present',
    String? notes,
    bool isFirstTimer = false,
  }) async {
    try {
      final response = await _dio.post(
        '/attendance',
        data: {
          'member_id': memberId,
          'event_id': eventId,
          'status': status,
          'notes': notes,
          'is_first_timer': isFirstTimer,
        },
      );

      if (response.statusCode == 201) {
        final attendance = Attendance.fromJson(response.data['data']);
        return ApiResponse.success(attendance, message: 'Attendance marked successfully');
      } else {
        return ApiResponse.error('Failed to mark attendance');
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  // Scan member ID endpoint
  Future<ApiResponse<Member>> scanMemberId(String memberIdentificationId, int eventId) async {
    try {
      final response = await _dio.post(
        ApiConstants.scanMemberEndpoint,
        data: {
          'member_identification_id': memberIdentificationId,
          'event_id': eventId,
        },
      );

      if (response.statusCode == 200) {
        print('ApiService: Scan member response received - Status: ${response.statusCode}');
        print('ApiService: Scan member response data: ${response.data}');
        
        // Handle scan member response structure
        final responseData = response.data;
        final memberData = responseData['data'] as Map<String, dynamic>?;
        
        if (memberData == null) {
          throw Exception('Invalid scan member response: missing data field');
        }
        
        final member = Member.fromJson(memberData);
        return ApiResponse.success(member);
      } else {
        return ApiResponse.error('Failed to scan member ID');
      }
    } catch (e) {
      print('ApiService: Scan member error: $e');
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  Future<ApiResponse<void>> healthCheck() async {
    try {
      // Use a simple endpoint that should work with authentication
      final response = await _dio.get('/events');
      
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