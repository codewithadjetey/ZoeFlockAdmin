class Validators {
  // Email validation
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  }
  
  // Password validation
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    
    return null;
  }
  
  // Member ID validation
  static String? validateMemberId(String? value) {
    if (value == null || value.isEmpty) {
      return 'Member ID is required';
    }
    
    // Remove any non-digit characters
    final cleanId = value.replaceAll(RegExp(r'[^0-9]'), '');
    
    if (cleanId.length != 14) {
      return 'Member ID must be 14 digits';
    }
    
    // Validate date part (first 8 digits should be a valid date)
    final year = int.tryParse(cleanId.substring(0, 4));
    final month = int.tryParse(cleanId.substring(4, 6));
    final day = int.tryParse(cleanId.substring(6, 8));
    
    if (year == null || month == null || day == null) {
      return 'Invalid Member ID format';
    }
    
    if (year < 1900 || year > DateTime.now().year + 1) {
      return 'Invalid year in Member ID';
    }
    
    if (month < 1 || month > 12) {
      return 'Invalid month in Member ID';
    }
    
    if (day < 1 || day > 31) {
      return 'Invalid day in Member ID';
    }
    
    // Check if the date is valid
    try {
      DateTime(year, month, day);
    } catch (e) {
      return 'Invalid date in Member ID';
    }
    
    return null;
  }
  
  // Required field validation
  static String? validateRequired(String? value, String fieldName) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }
    return null;
  }
  
  // Name validation
  static String? validateName(String? value, String fieldName) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }
    
    if (value.length < 2) {
      return '$fieldName must be at least 2 characters';
    }
    
    if (value.length > 50) {
      return '$fieldName must be less than 50 characters';
    }
    
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    final nameRegex = RegExp(r"^[a-zA-Z\s\-']+$");
    if (!nameRegex.hasMatch(value)) {
      return '$fieldName contains invalid characters';
    }
    
    return null;
  }
  
  // Phone number validation
  static String? validatePhoneNumber(String? value) {
    if (value == null || value.isEmpty) {
      return null; // Phone is optional
    }
    
    // Remove all non-digit characters
    final cleanNumber = value.replaceAll(RegExp(r'[^0-9]'), '');
    
    if (cleanNumber.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    
    if (cleanNumber.length > 15) {
      return 'Phone number must be less than 15 digits';
    }
    
    return null;
  }
  
  // Notes validation
  static String? validateNotes(String? value) {
    if (value == null || value.isEmpty) {
      return null; // Notes are optional
    }
    
    if (value.length > 500) {
      return 'Notes must be less than 500 characters';
    }
    
    return null;
  }
  
  // Event title validation
  static String? validateEventTitle(String? value) {
    if (value == null || value.isEmpty) {
      return 'Event title is required';
    }
    
    if (value.length < 3) {
      return 'Event title must be at least 3 characters';
    }
    
    if (value.length > 100) {
      return 'Event title must be less than 100 characters';
    }
    
    return null;
  }
  
  // QR Code validation
  static String? validateQRCode(String? value) {
    if (value == null || value.isEmpty) {
      return 'QR code is required';
    }
    
    // Check if it's a valid member ID format
    final memberIdError = validateMemberId(value);
    if (memberIdError == null) {
      return null;
    }
    
    // Check if it's a valid UUID format
    final uuidRegex = RegExp(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', caseSensitive: false);
    if (uuidRegex.hasMatch(value)) {
      return null;
    }
    
    return 'Invalid QR code format';
  }
  
  // Form validation helper
  static String? validateFormField(String? value, String fieldName, {bool required = true, int? minLength, int? maxLength}) {
    if (required && (value == null || value.isEmpty)) {
      return '$fieldName is required';
    }
    
    if (value != null && value.isNotEmpty) {
      if (minLength != null && value.length < minLength) {
        return '$fieldName must be at least $minLength characters';
      }
      
      if (maxLength != null && value.length > maxLength) {
        return '$fieldName must be less than $maxLength characters';
      }
    }
    
    return null;
  }
}
