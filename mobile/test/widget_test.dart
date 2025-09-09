import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:church_attendance_scanner/main.dart';
import 'package:church_attendance_scanner/services/api_service.dart';

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
  });

  testWidgets('App should load without crashing', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ChurchAttendanceApp());

    // Verify that the app loads without crashing
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
