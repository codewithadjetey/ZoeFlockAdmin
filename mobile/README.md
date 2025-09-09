# Church Attendance Scanner

A Flutter mobile application for church ushers to scan QR codes and mark member attendance at church events. This app integrates with the existing ZoeFlock Admin backend API.

## Features

- **QR Code Scanning**: Real-time camera scanning with auto-focus and flash toggle
- **Member Management**: Display member profiles with photos and details
- **Event Management**: Select and manage church events
- **Offline Support**: Cache data locally and sync when online
- **Attendance Tracking**: Mark attendance with notes and first-timer flags
- **Recent Scans**: Quick access to recently scanned members
- **Manual Entry**: Fallback input for member IDs when QR scanning fails

## Screenshots

*Screenshots will be added after UI implementation*

## Prerequisites

- Flutter SDK (3.10.0 or higher)
- Dart SDK (3.0.0 or higher)
- Android Studio / Xcode for mobile development
- Physical device for testing (camera functionality)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure API endpoints**
   - Open `lib/utils/constants.dart`
   - Update `ApiConstants.baseUrl` with your backend API URL

4. **Run the app**
   ```bash
   flutter run
   ```

## Configuration

### Backend API Setup

1. Ensure your Laravel backend is running
2. Update the API base URL in `lib/utils/constants.dart`
3. Configure authentication tokens in the app

### Database Setup

The app uses SQLite for local data storage. The database will be created automatically on first run.

### Permissions

#### Android
- Camera permission is automatically requested
- Internet permission for API calls
- Vibration permission for haptic feedback

#### iOS
- Camera usage description is configured
- Photo library access for member photos
- Microphone access for audio feedback

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
│   ├── member.dart
│   ├── event.dart
│   ├── attendance.dart
│   └── api_response.dart
├── services/                 # Business logic services
│   ├── api_service.dart
│   ├── database_service.dart
│   ├── auth_service.dart
│   └── scanner_service.dart
├── providers/                # State management
│   ├── auth_provider.dart
│   ├── event_provider.dart
│   └── attendance_provider.dart
├── screens/                  # UI screens
│   ├── login_screen.dart
│   ├── event_selection_screen.dart
│   ├── scanner_screen.dart
│   └── member_profile_screen.dart
├── widgets/                  # Reusable UI components
│   ├── custom_app_bar.dart
│   ├── event_card.dart
│   └── member_card.dart
└── utils/                    # Utilities and constants
    ├── constants.dart
    ├── helpers.dart
    └── validators.dart
```

## API Integration

The app integrates with the following backend endpoints:

- `POST /auth/login` - User authentication
- `GET /events` - Fetch available events
- `POST /attendance/scan-member-id` - Mark member attendance
- `GET /members/{id}` - Get member details

## Offline Support

- Member data is cached locally for offline scanning
- Attendance records are queued when offline
- Automatic sync when connection is restored
- Offline indicator in the UI

## Security Features

- Secure token storage using Flutter Secure Storage
- Auto-logout after 30 minutes of inactivity
- Encrypted local database
- Certificate pinning for API calls

## Development

### Running Tests

```bash
flutter test
```

### Building for Production

#### Android
```bash
flutter build apk --release
```

#### iOS
```bash
flutter build ios --release
```

### Code Generation

If using code generation tools:

```bash
flutter packages pub run build_runner build
```

## Troubleshooting

### Common Issues

1. **Camera not working**: Ensure you're testing on a physical device
2. **API connection failed**: Check your internet connection and API URL
3. **Build errors**: Run `flutter clean` and `flutter pub get`

### Debug Mode

Enable debug logging by setting `debugShowCheckedModeBanner: true` in `main.dart`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Changelog

### Version 1.0.0
- Initial release
- QR code scanning functionality
- Member profile management
- Event selection and management
- Offline support
- Attendance tracking
