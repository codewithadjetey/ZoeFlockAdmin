import 'package:flutter/material.dart';

/// Device type classification
enum DeviceType {
  mobile,
  tablet,
  desktop,
}

/// Responsive sizing utility that adapts to screen size
class ResponsiveSize {
  final BuildContext context;
  late final MediaQueryData _mediaQuery;
  late final double _screenWidth;
  late final double _screenHeight;
  late final DeviceType _deviceType;
  late final Orientation _orientation;

  ResponsiveSize(this.context) {
    _mediaQuery = MediaQuery.of(context);
    _screenWidth = _mediaQuery.size.width;
    _screenHeight = _mediaQuery.size.height;
    _orientation = _mediaQuery.orientation;
    _deviceType = _getDeviceType();
  }

  /// Screen breakpoints
  static const double mobileBreakpoint = 600;
  static const double tabletBreakpoint = 900;
  static const double desktopBreakpoint = 1200;

  /// Base dimensions for scaling (iPhone 11 as reference)
  static const double baseWidth = 414.0;
  static const double baseHeight = 896.0;

  /// Device type determination
  DeviceType _getDeviceType() {
    if (_screenWidth < mobileBreakpoint) {
      return DeviceType.mobile;
    } else if (_screenWidth < tabletBreakpoint) {
      return DeviceType.tablet;
    } else {
      return DeviceType.desktop;
    }
  }

  /// Getters
  double get screenWidth => _screenWidth;
  double get screenHeight => _screenHeight;
  DeviceType get deviceType => _deviceType;
  bool get isMobile => _deviceType == DeviceType.mobile;
  bool get isTablet => _deviceType == DeviceType.tablet;
  bool get isDesktop => _deviceType == DeviceType.desktop;
  bool get isPortrait => _orientation == Orientation.portrait;
  bool get isLandscape => _orientation == Orientation.landscape;

  /// Scale width proportionally (percentage-based)
  /// Example: wp(50) returns 50% of screen width
  double wp(double percentage) {
    return _screenWidth * (percentage / 100);
  }

  /// Scale height proportionally (percentage-based)
  /// Example: hp(50) returns 50% of screen height
  double hp(double percentage) {
    return _screenHeight * (percentage / 100);
  }

  /// Scale width based on reference device
  double scaleWidth(double size) {
    return (_screenWidth / baseWidth) * size;
  }

  /// Scale height based on reference device
  double scaleHeight(double size) {
    return (_screenHeight / baseHeight) * size;
  }

  /// Scale size based on shortest side (best for square elements)
  double scale(double size) {
    final shortestSide = _screenWidth < _screenHeight ? _screenWidth : _screenHeight;
    final baseShortestSide = baseWidth < baseHeight ? baseWidth : baseHeight;
    return (shortestSide / baseShortestSide) * size;
  }

  /// Responsive padding
  double get paddingSmall => scale(8.0);
  double get paddingMedium => scale(16.0);
  double get paddingLarge => scale(24.0);
  double get paddingXLarge => scale(32.0);

  /// Responsive radius
  double get radiusSmall => scale(4.0);
  double get radiusMedium => scale(8.0);
  double get radiusLarge => scale(12.0);
  double get radiusXLarge => scale(16.0);

  /// Responsive icon sizes
  double get iconSizeSmall => scale(16.0);
  double get iconSizeMedium => scale(24.0);
  double get iconSizeLarge => scale(32.0);
  double get iconSizeXLarge => scale(48.0);

  /// Responsive font sizes
  double get fontSizeSmall => scale(12.0);
  double get fontSizeMedium => scale(14.0);
  double get fontSizeLarge => scale(16.0);
  double get fontSizeXLarge => scale(20.0);
  double get fontSizeXXLarge => scale(24.0);
  double get fontSizeTitle => scale(28.0);
  double get fontSizeHeading => scale(32.0);

  /// Responsive button heights
  double get buttonHeightSmall => scaleHeight(36.0);
  double get buttonHeightMedium => scaleHeight(48.0);
  double get buttonHeightLarge => scaleHeight(56.0);

  /// Responsive card dimensions
  double get cardWidth => wp(90);
  double get cardHeight => hp(20);
  double get cardElevation => scale(4.0);

  /// Device-specific values
  T byDevice<T>({
    required T mobile,
    T? tablet,
    T? desktop,
  }) {
    switch (_deviceType) {
      case DeviceType.mobile:
        return mobile;
      case DeviceType.tablet:
        return tablet ?? mobile;
      case DeviceType.desktop:
        return desktop ?? tablet ?? mobile;
    }
  }

  /// Orientation-specific values
  T byOrientation<T>({
    required T portrait,
    required T landscape,
  }) {
    return isPortrait ? portrait : landscape;
  }

  /// Custom spacing based on device
  double spacing(double mobile, [double? tablet, double? desktop]) {
    return byDevice(
      mobile: scale(mobile),
      tablet: tablet != null ? scale(tablet) : null,
      desktop: desktop != null ? scale(desktop) : null,
    );
  }

  /// Grid column count based on screen size
  int get gridColumnCount {
    return byDevice(
      mobile: 2,
      tablet: 3,
      desktop: 4,
    );
  }

  /// Max content width (useful for tablets and desktops)
  double get maxContentWidth {
    return byDevice(
      mobile: _screenWidth,
      tablet: 600,
      desktop: 800,
    );
  }
}

/// Extension on BuildContext for easy access
extension ResponsiveSizeExtension on BuildContext {
  ResponsiveSize get responsive => ResponsiveSize(this);
  
  /// Shorthand getters
  double wp(double percentage) => ResponsiveSize(this).wp(percentage);
  double hp(double percentage) => ResponsiveSize(this).hp(percentage);
  double scale(double size) => ResponsiveSize(this).scale(size);
  bool get isMobile => ResponsiveSize(this).isMobile;
  bool get isTablet => ResponsiveSize(this).isTablet;
  bool get isDesktop => ResponsiveSize(this).isDesktop;
}

