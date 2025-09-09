class ApiResponse<T> {
  final bool success;
  final String? message;
  final T? data;
  final Map<String, dynamic>? errors;
  final int? statusCode;

  const ApiResponse({
    required this.success,
    this.message,
    this.data,
    this.errors,
    this.statusCode,
  });

  bool get hasData => data != null;
  bool get hasErrors => errors != null && errors!.isNotEmpty;
  bool get isSuccess => success && statusCode != null && statusCode! >= 200 && statusCode! < 300;

  String get errorMessage {
    if (message != null && message!.isNotEmpty) {
      return message!;
    }
    
    if (hasErrors) {
      final errorList = errors!.values.expand((e) => e is List ? e : [e]).toList();
      return errorList.isNotEmpty ? errorList.first.toString() : 'Unknown error';
    }
    
    return 'An error occurred';
  }

  factory ApiResponse.success(T data, {String? message, int? statusCode}) {
    return ApiResponse<T>(
      success: true,
      data: data,
      message: message,
      statusCode: statusCode ?? 200,
    );
  }

  factory ApiResponse.error(String message, {Map<String, dynamic>? errors, int? statusCode}) {
    return ApiResponse<T>(
      success: false,
      message: message,
      errors: errors,
      statusCode: statusCode ?? 400,
    );
  }

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(dynamic)? fromJsonT) {
    return ApiResponse<T>(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String?,
      data: json['data'] != null && fromJsonT != null ? fromJsonT(json['data']) : null,
      errors: json['errors'] as Map<String, dynamic>?,
      statusCode: json['status_code'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data,
      'errors': errors,
      'status_code': statusCode,
    };
  }

  ApiResponse<T> copyWith({
    bool? success,
    String? message,
    T? data,
    Map<String, dynamic>? errors,
    int? statusCode,
  }) {
    return ApiResponse<T>(
      success: success ?? this.success,
      message: message ?? this.message,
      data: data ?? this.data,
      errors: errors ?? this.errors,
      statusCode: statusCode ?? this.statusCode,
    );
  }

  @override
  String toString() {
    return 'ApiResponse(success: $success, message: $message, hasData: $hasData, statusCode: $statusCode)';
  }
}

// Specific response types for common API responses
class LoginResponse {
  final String accessToken;
  final String refreshToken;
  final String tokenType;
  final int expiresIn;
  final Map<String, dynamic> user;

  const LoginResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.tokenType,
    required this.expiresIn,
    required this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      accessToken: json['access_token'] as String,
      refreshToken: json['refresh_token'] as String,
      tokenType: json['token_type'] as String? ?? 'Bearer',
      expiresIn: json['expires_in'] as int? ?? 3600,
      user: json['user'] as Map<String, dynamic>? ?? {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'refresh_token': refreshToken,
      'token_type': tokenType,
      'expires_in': expiresIn,
      'user': user,
    };
  }
}

class ScanMemberResponse {
  final Map<String, dynamic> member;
  final Map<String, dynamic> event;
  final Map<String, dynamic> attendance;

  const ScanMemberResponse({
    required this.member,
    required this.event,
    required this.attendance,
  });

  factory ScanMemberResponse.fromJson(Map<String, dynamic> json) {
    return ScanMemberResponse(
      member: json['member'] as Map<String, dynamic>,
      event: json['event'] as Map<String, dynamic>,
      attendance: json['attendance'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'member': member,
      'event': event,
      'attendance': attendance,
    };
  }
}

class PaginatedResponse<T> {
  final List<T> data;
  final int currentPage;
  final int lastPage;
  final int perPage;
  final int total;
  final String? nextPageUrl;
  final String? prevPageUrl;

  const PaginatedResponse({
    required this.data,
    required this.currentPage,
    required this.lastPage,
    required this.perPage,
    required this.total,
    this.nextPageUrl,
    this.prevPageUrl,
  });

  bool get hasNextPage => nextPageUrl != null;
  bool get hasPrevPage => prevPageUrl != null;

  factory PaginatedResponse.fromJson(Map<String, dynamic> json, T Function(dynamic) fromJsonT) {
    return PaginatedResponse<T>(
      data: (json['data'] as List).map((item) => fromJsonT(item)).toList(),
      currentPage: json['current_page'] as int,
      lastPage: json['last_page'] as int,
      perPage: json['per_page'] as int,
      total: json['total'] as int,
      nextPageUrl: json['next_page_url'] as String?,
      prevPageUrl: json['prev_page_url'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'data': data,
      'current_page': currentPage,
      'last_page': lastPage,
      'per_page': perPage,
      'total': total,
      'next_page_url': nextPageUrl,
      'prev_page_url': prevPageUrl,
    };
  }
}
