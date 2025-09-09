import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:church_attendance_scanner/main.dart';
import 'package:church_attendance_scanner/services/api_service.dart';
import 'package:church_attendance_scanner/models/api_response.dart';

void main() {
  group('API Service Initialization Tests', () {
    test('ApiService should initialize without throwing LateInitializationError', () async {
      // Create an instance of ApiService
      final apiService = ApiService();
      
      // Initialize the service
      apiService.initialize();
      
      // Verify that the service is properly initialized
      // This should not throw a LateInitializationError
      expect(() => apiService.healthCheck(), returnsNormally);
    });

    test('ApiService should be a singleton', () {
      // Create two instances
      final apiService1 = ApiService();
      final apiService2 = ApiService();
      
      // They should be the same instance
      expect(identical(apiService1, apiService2), isTrue);
    });

    test('ApiService should handle login errors properly', () async {
      final apiService = ApiService();
      apiService.initialize();
      
      // Test with invalid credentials
      final response = await apiService.login('invalid@email.com', 'wrongpassword');
      
      // Should return an error response
      expect(response.isSuccess, isFalse);
      expect(response.errorMessage, isNotEmpty);
      expect(response.statusCode, isNotNull);
    });

    test('LoginResponse should handle actual backend response structure', () {
      // Test with the actual backend response structure
      final jsonResponse = {
        'success': true,
        'message': 'Login successful',
        'data': {
          'user': {
            'id': 1,
            'name': 'Super Adminsszs',
            'email': 'admin@zoeflock.com',
            'phone': '+1234567890',
            'address': '123 Admin Street, Admin City, AC 12345s',
            'date_of_birth': '1990-01-01T00:00:00.000000Z',
            'gender': 'other',
            'profile_picture': null,
            'is_active': true,
            'email_verified_at': '2025-09-05T01:54:53.000000Z',
            'created_at': '2025-09-05T01:54:53.000000Z',
            'updated_at': '2025-09-06T11:27:39.000000Z',
          },
          'token': '10|iWo7suYcb18a0eI55T0kTLOEYOXGoRxwbpBlamKpda3bf1bd',
          'token_type': 'Bearer',
          'expires_in': 0,
          'refresh_token': null
        }
      };

      final loginResponse = LoginResponse.fromJson(jsonResponse['data']! as Map<String, dynamic>);
      
      // Verify the response is parsed correctly
      expect(loginResponse.accessToken, equals('10|iWo7suYcb18a0eI55T0kTLOEYOXGoRxwbpBlamKpda3bf1bd'));
      expect(loginResponse.refreshToken, isNull);
      expect(loginResponse.tokenType, equals('Bearer'));
      expect(loginResponse.expiresIn, equals(0));
      expect(loginResponse.user['name'], equals('Super Adminsszs'));
      expect(loginResponse.user['email'], equals('admin@zoeflock.com'));
    });
  });

  testWidgets('App should load without crashing', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ChurchAttendanceApp());

    // Verify that the app loads without crashing
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
