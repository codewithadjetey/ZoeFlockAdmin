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
          // Log the complete request details
          print('🚀 INTERCEPTOR ACTIVE - API REQUEST: ${options.method.toUpperCase()} ${options.uri}');
          print('📋 Request Data: ${options.data}');
          print('🔍 Query Parameters: ${options.queryParameters}');
          print('📝 Request Headers: ${options.headers}');
          print('🔑 Access token: ${_accessToken != null ? "Present" : "Not available"}');
          if (_accessToken != null) {
            print('🎫 Full Token: $_accessToken');
          }
          
          if (_accessToken != null) {
            options.headers['Authorization'] = 'Bearer $_accessToken';
          }
          
          handler.next(options);
        },
        onResponse: (response, handler) {
          // Log successful responses
          print('✅ INTERCEPTOR ACTIVE - API RESPONSE: ${response.statusCode} ${response.requestOptions.uri}');
          print('📊 Response Data: ${response.data}');
          print('📝 Response Headers: ${response.headers}');
          handler.next(response);
        },
        onError: (error, handler) async {
          // Log error responses
          print('❌ INTERCEPTOR ACTIVE - API ERROR: ${error.response?.statusCode ?? "No status"} ${error.requestOptions.uri}');
          print('💥 Error Message: ${error.message}');
          print('🔍 Request Query Parameters: ${error.requestOptions.queryParameters}');
          print('📝 Request Headers: ${error.requestOptions.headers}');
          print('🔑 Access token: ${_accessToken != null ? "Present" : "Not available"}');
          if (_accessToken != null) {
            print('🎫 Full Token: $_accessToken');
          }
          if (error.response?.data != null) {
            print('📊 Error Data: ${error.response?.data}');
          }
          if (error.response?.headers != null) {
            print('📝 Error Response Headers: ${error.response?.headers}');
          }
          
          if (error.response?.statusCode == 401) {
            print('🔄 Attempting token refresh...');
            // Try to refresh token
            final refreshed = await _refreshAccessToken();
            if (refreshed) {
              print('✅ Token refreshed successfully, retrying request...');
              // Retry the original request
              final options = error.requestOptions;
              options.headers['Authorization'] = 'Bearer $_accessToken';
              try {
                final response = await _dio.fetch(options);
                handler.resolve(response);
                return;
              } catch (e) {
                print('❌ Retry failed: $e');
                // Refresh failed, continue with error
              }
            } else {
              print('❌ Token refresh failed');
            }
          }
          handler.next(error);
        },
      ));
      print('🚀 ApiService: Interceptors added successfully - URL logging is ACTIVE');
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
      final response = await _dio.post(
        ApiConstants.loginEndpoint,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        // Extract the data field from the response which contains the actual login data
        final responseData = response.data;
        final loginData = responseData['data'] as Map<String, dynamic>?;
        
        if (loginData == null) {
          throw Exception('Invalid login response: missing data field');
        }
        
        final loginResponse = LoginResponse.fromJson(loginData);
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
      
      // Handle DioError specifically to extract backend error messages
      if (e is DioException) {
        final statusCode = e.response?.statusCode;
        final responseData = e.response?.data;
        
        
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
  Future<ApiResponse<List<Event>>> getEvents({bool eligibleForAttendance = false}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (eligibleForAttendance) {
        queryParams['for_attendance'] = true;
        queryParams['status'] = 'published';
      }
      
      final response = await _dio.get(
        ApiConstants.eventsEndpoint,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      if (response.statusCode == 200) {
        
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
        
        return ApiResponse.success(events);
      } else {
        return ApiResponse.error('Failed to fetch events');
      }
    } catch (e) {
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  Future<ApiResponse<List<Event>>> getEligibleEvents() async {
    return getEvents(eligibleForAttendance: true);
  }

  Future<ApiResponse<Event>> getEvent(int id) async {
    try {
      final response = await _dio.get('${ApiConstants.eventsEndpoint}/$id');
      
      if (response.statusCode == 200) {
        
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
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  // Member endpoints
  Future<ApiResponse<Member>> getMember(int id) async {
    try {
      final response = await _dio.get('${ApiConstants.memberEndpoint}/$id');
      
      if (response.statusCode == 200) {
        
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
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  /// Get all members for sync (with pagination support)
  Future<ApiResponse<Map<String, dynamic>>> getAllMembers({
    int page = 1,
    int perPage = 100,
    String? search,
    String? status,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'per_page': perPage,
      };
      
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      
      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      print('ApiService: Getting members - page: $page, perPage: $perPage, queryParams: $queryParams');
      print('ApiService: Member endpoint: ${ApiConstants.memberEndpoint}');

      final response = await _dio.get(
        ApiConstants.memberEndpoint,
        queryParameters: queryParams,
      );
      
      print('ApiService: Members response status: ${response.statusCode}');
      print('ApiService: Members response data: ${response.data}');
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        
        // Check if response has success field (Laravel API format)
        if (responseData is Map<String, dynamic>) {
          if (responseData.containsKey('success') && responseData['success'] == true) {
            // Check for members field first (backend specific format)
            if (responseData.containsKey('members')) {
              return ApiResponse.success(responseData['members']);
            } else if (responseData.containsKey('data')) {
              return ApiResponse.success(responseData['data']);
            } else {
              return ApiResponse.error('No data field found in response');
            }
          } else if (responseData.containsKey('data')) {
            // Direct data response without success wrapper
            return ApiResponse.success(responseData['data']);
          } else if (responseData.containsKey('members')) {
            // Direct members response without success wrapper
            return ApiResponse.success(responseData['members']);
          } else {
            // Response might be the data directly
            return ApiResponse.success(responseData);
          }
        } else {
          return ApiResponse.error('Invalid response format');
        }
      } else {
        return ApiResponse.error('Failed to get members: ${response.statusCode}');
      }
    } catch (e) {
      print('ApiService: Error getting members: $e');
      print('ApiService: Error type: ${e.runtimeType}');
      return ApiResponse.error('Failed to get members: ${e.toString()}');
    }
  }

  /// Get a single member by ID
  Future<ApiResponse<Member>> getMemberById(int memberId) async {
    try {
      print('ApiService: Getting member by ID: $memberId');
      
      final response = await _dio.get('/members/$memberId');

      print('ApiService: Member response status: ${response.statusCode}');
      print('ApiService: Member response data: ${response.data}');

      if (response.statusCode == 200) {
        final responseData = response.data;
        
        if (responseData is Map<String, dynamic>) {
          if (responseData.containsKey('success') && responseData['success'] == true) {
            final memberData = responseData['data'];
            final member = Member.fromJson(memberData);
            return ApiResponse.success(member);
          } else if (responseData.containsKey('data')) {
            final member = Member.fromJson(responseData['data']);
            return ApiResponse.success(member);
          } else {
            return ApiResponse.error('No data field found in response');
          }
        } else {
          return ApiResponse.error('Invalid response format');
        }
      } else {
        return ApiResponse.error('Failed to get member: HTTP ${response.statusCode}');
      }
    } catch (e) {
      print('ApiService: Error getting member: $e');
      return ApiResponse.error('Failed to get member: ${e.toString()}');
    }
  }

  /// Get all groups
  Future<ApiResponse<List<Map<String, dynamic>>>> getAllGroups() async {
    try {
      print('🚀 ApiService: Getting all groups...');
      final response = await _dio.get('/groups');
      
      print('✅ ApiService: Groups response status: ${response.statusCode}');
      print('📊 ApiService: Groups response data: ${response.data}');
      
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> groupsData = data['data'];
          final groups = groupsData.cast<Map<String, dynamic>>();
          print('🚀 ApiService: ✅ Successfully got ${groups.length} groups');
          return ApiResponse.success(groups);
        } else {
          print('🚀 ApiService: ❌ Failed to get groups - API returned success: false');
          return ApiResponse.error('Failed to get groups');
        }
      } else {
        print('🚀 ApiService: ❌ Failed to get groups - Invalid response');
        return ApiResponse.error('Failed to get groups');
      }
    } catch (e) {
      print('🚀 ApiService: ❌ Failed to get groups');
      print('Error getting groups: $e');
      return ApiResponse.error('Failed to get groups');
    }
  }

  /// Get all families
  Future<ApiResponse<List<Map<String, dynamic>>>> getAllFamilies() async {
    try {
      print('🚀 ApiService: Getting all families...');
      final response = await _dio.get('/families');
      
      print('✅ ApiService: Families response status: ${response.statusCode}');
      print('📊 ApiService: Families response data: ${response.data}');
      
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> familiesData = data['data'];
          final families = familiesData.cast<Map<String, dynamic>>();
          print('🚀 ApiService: ✅ Successfully got ${families.length} families');
          return ApiResponse.success(families);
        } else {
          print('🚀 ApiService: ❌ Failed to get families - API returned success: false');
          return ApiResponse.error('Failed to get families');
        }
      } else {
        print('🚀 ApiService: ❌ Failed to get families - Invalid response');
        return ApiResponse.error('Failed to get families');
      }
    } catch (e) {
      print('🚀 ApiService: ❌ Failed to get families');
      print('Error getting families: $e');
      return ApiResponse.error('Failed to get families');
    }
  }

  /// Get all first timers
  Future<ApiResponse<List<Map<String, dynamic>>>> getAllFirstTimers() async {
    try {
      print('🚀 ApiService: Getting all first timers...');
      final response = await _dio.get('/first-timers');
      
      print('✅ ApiService: First timers response status: ${response.statusCode}');
      print('📊 ApiService: First timers response data: ${response.data}');
      
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> firstTimersData = data['data'];
          final firstTimers = firstTimersData.cast<Map<String, dynamic>>();
          print('🚀 ApiService: ✅ Successfully got ${firstTimers.length} first timers');
          return ApiResponse.success(firstTimers);
        } else {
          print('🚀 ApiService: ❌ Failed to get first timers - API returned success: false');
          return ApiResponse.error('Failed to get first timers');
        }
      } else {
        print('🚀 ApiService: ❌ Failed to get first timers - Invalid response');
        return ApiResponse.error('Failed to get first timers');
      }
    } catch (e) {
      print('🚀 ApiService: ❌ Failed to get first timers');
      print('Error getting first timers: $e');
      return ApiResponse.error('Failed to get first timers');
    }
  }

  // Attendance endpoints
  Future<ApiResponse<Attendance>> markAttendance(int memberId, int eventId, {
    String status = 'present',
    String? notes,
    bool isFirstTimer = false,
  }) async {
    try {
      print('🚀 ApiService: Marking attendance for member $memberId at event $eventId');
      print('🚀 ApiService: Status: $status, Notes: $notes, IsFirstTimer: $isFirstTimer');
      
      // Get member identification ID from the member ID
      final memberResponse = await getMemberById(memberId);
      if (!memberResponse.isSuccess || memberResponse.data == null) {
        print('🚀 ApiService: ❌ Failed to get member details for ID: $memberId');
        return ApiResponse.error('Failed to get member details');
      }
      
      final memberIdentificationId = memberResponse.data!.memberIdentificationId;
      print('🚀 ApiService: Member identification ID: $memberIdentificationId');
      
      final requestData = {
        'member_identification_id': memberIdentificationId,
        'event_id': eventId,
        'notes': notes,
      };
      
      print('🚀 ApiService: Request data: $requestData');
      
      final response = await _dio.post(
        '/attendance/scan-member-id',
        data: requestData,
      );

      print('🚀 ApiService: Response status code: ${response.statusCode}');
      print('🚀 ApiService: Response data: ${response.data}');

      if (response.statusCode == 200 && response.data['success'] == true) {
        // The backend returns attendance data in response.data.data.attendance
        final attendanceData = response.data['data']['attendance'];
        final attendance = Attendance.fromJson(attendanceData);
        print('🚀 ApiService: ✅ Attendance marked successfully with ID: ${attendance.id}');
        return ApiResponse.success(attendance, message: 'Attendance marked successfully');
      } else {
        print('🚀 ApiService: ❌ Failed to mark attendance - Status: ${response.statusCode}');
        print('🚀 ApiService: ❌ Response message: ${response.data['message']}');
        return ApiResponse.error(response.data['message'] ?? 'Failed to mark attendance');
      }
    } catch (e) {
      print('🚀 ApiService: ❌ Error marking attendance: $e');
      print('🚀 ApiService: Error type: ${e.runtimeType}');
      return ApiResponse.error(AppHelpers.getErrorMessage(e));
    }
  }

  // Scan member ID endpoint
  Future<ApiResponse<Member>> scanMemberId(String memberIdentificationId, int eventId) async {
    try {
      print('🚀 ApiService: Scanning member ID: $memberIdentificationId for event: $eventId');
      final response = await _dio.post(
        ApiConstants.scanMemberEndpoint,
        data: {
          'member_identification_id': memberIdentificationId,
          'event_id': eventId,
        },
      );

      if (response.statusCode == 200) {
        
        // Handle scan member response structure
        final responseData = response.data;
        final data = responseData['data'] as Map<String, dynamic>?;
        
        if (data == null) {
          throw Exception('Invalid scan member response: missing data field');
        }
        
        // Extract member data from the response
        final memberData = data['member'] as Map<String, dynamic>?;
        if (memberData == null) {
          throw Exception('Invalid scan member response: missing member field');
        }
        
        // Create Member object from the member data
        // Note: The backend returns limited member info, so we'll create a partial Member object
        final member = Member(
          id: memberData['id'] ?? 0,
          firstName: memberData['name']?.split(' ').first ?? '',
          lastName: memberData['name']?.split(' ').skip(1).join(' ') ?? '',
          email: memberData['email'] ?? '',
          memberIdentificationId: memberIdentificationId,
          status: 'active', // Assume active since they're scanning attendance
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        
        return ApiResponse.success(member, message: responseData['message'] ?? 'Attendance marked successfully');
      } else {
        return ApiResponse.error('Failed to scan member ID');
      }
    } catch (e) {
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

  // Get Dio instance for custom requests
  Dio get dio => _dio;
}