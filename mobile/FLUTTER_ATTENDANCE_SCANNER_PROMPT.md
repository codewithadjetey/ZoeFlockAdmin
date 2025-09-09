# Flutter Church Attendance Scanner App

## Project Overview
Create a Flutter mobile app that allows church ushers to scan QR codes from members' phones to mark attendance at church events. This app will integrate with the existing ZoeFlock Admin backend API.

## App Purpose
- **Primary Users**: Church ushers and volunteers
- **Main Function**: Scan QR codes to mark member attendance
- **Platform**: Cross-platform (iOS & Android)
- **Backend Integration**: REST API with existing Laravel backend

## Core Features

### 1. QR Code Scanner
- **Real-time camera scanning** using `qr_code_scanner` package
- **Auto-focus and flash toggle** for various lighting conditions
- **Beep/vibration feedback** on successful scan
- **Manual entry fallback** (type member ID if QR scan fails)
- **Support for both front and back cameras**
- **Continuous scanning mode** for rapid attendance marking

### 2. Member Profile Display
When a QR code is scanned, display:
- Member photo (with placeholder if not available)
- Full name (first_name + last_name)
- Email address
- Member ID number (14-digit format: yyyymmdd + 6 random digits)
- Group/Family information
- Gender
- Last attendance date
- Member status (active/inactive)

### 3. Event Management
- **Select current event** from dropdown/list
- **Show event details** (name, date, location, time)
- **Display attendance count** for current event
- **Quick event switching** without losing scan progress
- **Event history** (recent events)

### 4. Attendance Actions
- **Mark as "Present"** with one tap
- **Add optional notes** for special circumstances
- **Mark as "First Timer"** if applicable
- **Undo last action** (if within 30 seconds)
- **Show confirmation** with member photo and success animation
- **Bulk operations** for multiple members

### 5. Offline Support
- **Cache member data** for offline scanning
- **Queue attendance records** when offline
- **Sync when connection restored** with progress indicator
- **Show offline indicator** in UI
- **Local SQLite database** for data persistence

## Technical Requirements

### Flutter Dependencies
```yaml
dependencies:
  flutter:
    sdk: flutter
  qr_code_scanner: ^1.0.1
  http: ^1.1.0
  shared_preferences: ^2.2.2
  sqflite: ^2.3.0
  path: ^1.8.3
  image_picker: ^1.0.4
  permission_handler: ^11.0.1
  connectivity_plus: ^5.0.2
  cached_network_image: ^3.3.0
  flutter_local_notifications: ^16.3.0
  vibration: ^1.8.4
  audioplayers: ^5.2.1
  intl: ^0.19.0
  provider: ^6.1.1
  dio: ^5.4.0
```

### Backend API Integration
- **Base URL**: `https://your-domain.com/api/v1`
- **Authentication**: Bearer token stored securely
- **Key endpoints**:
  - `POST /attendance/scan-member-id` - Scan member and mark attendance
  - `GET /events` - List available events
  - `GET /events/{id}` - Get specific event details
  - `GET /members/{id}` - Get member details
  - `POST /auth/login` - Usher authentication
  - `POST /auth/refresh` - Refresh authentication token

### API Request/Response Format

#### Scan Member ID Request
```json
{
  "barcode": "20250128123456",
  "event_id": 123,
  "notes": "Optional notes"
}
```

#### Scan Member ID Response
```json
{
  "success": true,
  "data": {
    "member": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "profile_image_path": "storage/members/profile1.jpg",
      "member_identification_id": "20250128123456",
      "group": "Youth Group",
      "family": "Doe Family",
      "gender": "male"
    },
    "event": {
      "id": 123,
      "title": "Sunday Service",
      "start_date": "2025-01-28",
      "location": "Main Sanctuary"
    },
    "attendance": {
      "id": 456,
      "status": "present",
      "check_in_time": "09:30:00",
      "notes": "On time"
    }
  }
}
```

## UI/UX Requirements

### Design System
- **Primary Colors**: Church blue (#1e40af), Gold (#f59e0b), White (#ffffff)
- **Secondary Colors**: Gray scale for text and backgrounds
- **Typography**: Roboto (Android), SF Pro (iOS)
- **Icons**: Material Design Icons or Font Awesome
- **Theme**: Clean, modern, church-appropriate

### Key Screens

#### 1. Login Screen
- Usher email/password input
- Remember me checkbox
- Forgot password link
- Loading states and error handling
- Church logo and branding

#### 2. Event Selection Screen
- List of available events
- Search/filter functionality
- Event details preview
- Quick stats (attendance count)
- Refresh button

#### 3. Scanner Screen (Main)
- **Camera viewfinder** (top 60% of screen)
- **Event info bar** (showing current event name and time)
- **Manual entry field** (for fallback input)
- **Recent scans list** (last 5 members with photos)
- **Settings/event switch button**
- **Flash toggle** and camera switch
- **Scanning overlay** with target frame

#### 4. Member Profile Screen
- **Large member photo** (with placeholder)
- **Member details** in card layout
- **Action buttons** (Mark Present, Add Notes, Cancel)
- **Previous attendance history**
- **Success animation** after marking attendance

#### 5. Settings Screen
- **App configuration** (sounds, vibrations, theme)
- **Offline data management**
- **Logout functionality**
- **About/Help section**
- **Version information**

### Responsive Design
- **Phone layouts** (portrait and landscape)
- **Tablet support** with optimized layouts
- **One-handed operation** for phones
- **Accessibility features** (large text, high contrast)

## Performance Requirements
- **Fast QR detection** (< 1 second response time)
- **Smooth camera performance** (60fps)
- **Quick API responses** with loading indicators
- **Minimal battery drain** with efficient scanning
- **Works in various lighting** (indoor/outdoor)
- **Memory efficient** with proper image caching

## Security Features
- **Secure token storage** using Flutter Secure Storage
- **Auto-logout** after 30 minutes of inactivity
- **Encrypted local database** for sensitive data
- **No sensitive data in logs** or crash reports
- **Certificate pinning** for API calls
- **Biometric authentication** (optional)

## Error Handling
- **Network connection errors** with retry options
- **Invalid QR codes** with helpful messages
- **API errors** with user-friendly descriptions
- **Camera permission issues** with guidance
- **Member not found** scenarios
- **Offline mode** with sync indicators
- **App crashes** with graceful recovery

## Additional Features

### Statistics Dashboard
- **Daily attendance counts**
- **Weekly/monthly trends**
- **Member attendance history**
- **Event comparison charts**
- **Export functionality** (CSV/PDF)

### Search and Filter
- **Search members by name**
- **Filter by group/family**
- **Recent attendees** quick access
- **Favorites** for frequent members

### Notifications
- **Scan success** with haptic feedback
- **Offline sync** completion
- **Event reminders**
- **Error alerts**

### Accessibility
- **Voice over support** for screen readers
- **Large text options**
- **High contrast mode**
- **Voice commands** for hands-free operation

## Development Guidelines

### Code Structure
```
lib/
├── main.dart
├── models/
│   ├── member.dart
│   ├── event.dart
│   ├── attendance.dart
│   └── api_response.dart
├── services/
│   ├── api_service.dart
│   ├── database_service.dart
│   ├── auth_service.dart
│   └── scanner_service.dart
├── screens/
│   ├── login_screen.dart
│   ├── event_selection_screen.dart
│   ├── scanner_screen.dart
│   ├── member_profile_screen.dart
│   └── settings_screen.dart
├── widgets/
│   ├── member_card.dart
│   ├── event_card.dart
│   ├── qr_scanner_widget.dart
│   └── custom_app_bar.dart
├── providers/
│   ├── auth_provider.dart
│   ├── event_provider.dart
│   └── attendance_provider.dart
└── utils/
    ├── constants.dart
    ├── validators.dart
    └── helpers.dart
```

### State Management
- **Provider pattern** for state management
- **Separate providers** for auth, events, and attendance
- **Local storage** for offline data
- **Reactive UI** updates

### Testing
- **Unit tests** for business logic
- **Widget tests** for UI components
- **Integration tests** for API calls
- **Mock data** for development

## Platform-Specific Considerations

### iOS
- **Camera permissions** in Info.plist
- **App Transport Security** for HTTPS
- **Background app refresh** for sync
- **Push notifications** setup

### Android
- **Camera permissions** in AndroidManifest.xml
- **Network security config** for API calls
- **Background services** for sync
- **Notification channels** setup

## Deployment

### Build Configuration
- **Debug builds** for development
- **Release builds** for production
- **Code signing** for app stores
- **Version management** with semantic versioning

### App Store Requirements
- **App icons** in all required sizes
- **Screenshots** for store listings
- **Privacy policy** and terms of service
- **App store descriptions** and keywords

## Future Enhancements
- **Facial recognition** for member identification
- **Voice commands** for hands-free operation
- **Wearable app** for smartwatches
- **Multi-language support**
- **Advanced analytics** and reporting
- **Integration with church management systems**

## Getting Started
1. **Set up Flutter development environment**
2. **Clone the repository** and install dependencies
3. **Configure API endpoints** in constants.dart
4. **Set up backend authentication** tokens
5. **Test on physical devices** (camera functionality)
6. **Implement offline database** schema
7. **Add error handling** and user feedback
8. **Test in various lighting conditions**
9. **Optimize performance** and battery usage
10. **Prepare for app store submission**

---

**Note**: This prompt provides comprehensive specifications for creating a professional Flutter mobile app for church attendance scanning. The app should be user-friendly, reliable, and integrate seamlessly with the existing ZoeFlock Admin backend system.
