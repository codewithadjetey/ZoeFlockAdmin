import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/services.dart';

import 'providers/auth_provider.dart';
import 'providers/event_provider.dart';
import 'providers/attendance_provider.dart';
import 'providers/dashboard_provider.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/event_selection_screen.dart';
import 'screens/scanner_screen.dart';
import 'screens/settings_screen.dart';
import 'services/database_service.dart';
import 'services/domain_config_service.dart';
import 'utils/constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize services
  await DomainConfigService.initialize();
  
  // Set preferred orientations
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  runApp(const ChurchAttendanceApp());
}

class ChurchAttendanceApp extends StatelessWidget {
  const ChurchAttendanceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => EventProvider()),
        ChangeNotifierProvider(create: (_) => AttendanceProvider()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
      ],
      child: MaterialApp(
        title: 'Church Attendance Scanner',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.blue,
          primaryColor: AppColors.primaryBlue,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.primaryBlue,
            brightness: Brightness.dark,
          ),
          useMaterial3: true,
          scaffoldBackgroundColor: const Color(0xFF121212),
          appBarTheme: const AppBarTheme(
            centerTitle: true,
            elevation: 0,
            backgroundColor: AppColors.primaryBlue,
            foregroundColor: Colors.white,
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryBlue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          cardTheme: const CardThemeData(
            elevation: 4,
            color: Color(0xFF2a2a2a),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(12)),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: const Color(0xFF2a2a2a),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFF404040)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFF404040)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.primaryBlue, width: 2),
            ),
          ),
        ),
        home: const AuthWrapper(),
        routes: {
          '/login': (context) => const LoginScreen(),
          '/dashboard': (context) => const DashboardScreen(),
          '/events': (context) => const EventSelectionScreen(),
          '/scanner': (context) => const ScannerScreen(),
          '/settings': (context) => const SettingsScreen(),
        },
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    try {
      print('App: Starting app initialization...');
      
      print('App: Initializing database service...');
      await DatabaseService().initialize();
      print('App: Database service initialized');
      
      print('App: Getting auth provider...');
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      print('App: Auth provider obtained');
      
      print('App: Initializing auth provider...');
      await authProvider.initialize();
      print('App: Auth provider initialized');
      
      print('App: Checking final auth state...');
      print('App: isAuthenticated: ${authProvider.isAuthenticated}');
      print('App: isLoading: ${authProvider.isLoading}');
      print('App: currentUser: ${authProvider.currentUser?.fullName}');
      
    } catch (e) {
      print('App: Error initializing app: $e');
      print('App: Error type: ${e.runtimeType}');
      print('App: Error stack trace: ${StackTrace.current}');
    } finally {
      print('App: Setting initialization complete...');
      if (mounted) {
        setState(() {
          _isInitialized = true;
        });
        print('App: Initialization complete flag set');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    print('App: Build method called - _isInitialized: $_isInitialized');
    
    if (!_isInitialized) {
      print('App: Showing loading screen (not initialized)');
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        print('App: Consumer builder called - isLoading: ${authProvider.isLoading}, isAuthenticated: ${authProvider.isAuthenticated}');
        
        if (authProvider.isLoading) {
          print('App: Showing loading screen (auth provider loading)');
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }
        
        if (authProvider.isAuthenticated) {
          print('App: Showing DashboardScreen (authenticated)');
          return const DashboardScreen();
        }
        
        print('App: Showing LoginScreen (not authenticated)');
        return const LoginScreen();
      },
    );
  }
}
