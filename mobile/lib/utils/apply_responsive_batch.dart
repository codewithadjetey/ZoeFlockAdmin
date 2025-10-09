/// This file documents all the find-and-replace patterns needed to make
/// the entire app responsive. Apply these systematically to all screens and widgets.
/// 
/// IMPORTANT: Always add 'import '../utils/responsive_size.dart';' at the top

// ============================================================================
// STEP 1: Add imports to all files
// ============================================================================
// Add this line after existing imports:
// import '../utils/responsive_size.dart';

// ============================================================================
// STEP 2: Create responsive instance in build methods
// ============================================================================
// Add at the start of build() or any widget builder method:
// final responsive = ResponsiveSize(context);

// ============================================================================
// STEP 3: Replace all const EdgeInsets
// ============================================================================
// REPLACE: const EdgeInsets.all(AppDimensions.paddingSmall)
// WITH:    EdgeInsets.all(responsive.paddingSmall)
//
// REPLACE: const EdgeInsets.all(AppDimensions.paddingMedium)
// WITH:    EdgeInsets.all(responsive.paddingMedium)
//
// REPLACE: const EdgeInsets.all(AppDimensions.paddingLarge)
// WITH:    EdgeInsets.all(responsive.paddingLarge)
//
// REPLACE: const EdgeInsets.all(8)
// WITH:    EdgeInsets.all(responsive.paddingSmall)
//
// REPLACE: const EdgeInsets.all(16)
// WITH:    EdgeInsets.all(responsive.paddingMedium)
//
// REPLACE: const EdgeInsets.all(24)
// WITH:    EdgeInsets.all(responsive.paddingLarge)
//
// REPLACE: const EdgeInsets.symmetric(horizontal: AppDimensions.paddingMedium)
// WITH:    EdgeInsets.symmetric(horizontal: responsive.paddingMedium)
//
// REPLACE: const EdgeInsets.symmetric(vertical: AppDimensions.paddingMedium)
// WITH:    EdgeInsets.symmetric(vertical: responsive.paddingMedium)

// ============================================================================
// STEP 4: Replace all const SizedBox
// ============================================================================
// REPLACE: const SizedBox(height: AppDimensions.paddingSmall)
// WITH:    SizedBox(height: responsive.paddingSmall)
//
// REPLACE: const SizedBox(height: AppDimensions.paddingMedium)
// WITH:    SizedBox(height: responsive.paddingMedium)
//
// REPLACE: const SizedBox(height: AppDimensions.paddingLarge)
// WITH:    SizedBox(height: responsive.paddingLarge)
//
// REPLACE: const SizedBox(width: AppDimensions.paddingSmall)
// WITH:    SizedBox(width: responsive.paddingSmall)
//
// REPLACE: const SizedBox(width: AppDimensions.paddingMedium)
// WITH:    SizedBox(width: responsive.paddingMedium)
//
// REPLACE: const SizedBox(height: 8)
// WITH:    SizedBox(height: responsive.paddingSmall)
//
// REPLACE: const SizedBox(height: 16)
// WITH:    SizedBox(height: responsive.paddingMedium)
//
// REPLACE: const SizedBox(height: 24)
// WITH:    SizedBox(height: responsive.paddingLarge)

// ============================================================================
// STEP 5: Replace BorderRadius.circular
// ============================================================================
// REPLACE: BorderRadius.circular(AppDimensions.radiusSmall)
// WITH:    BorderRadius.circular(responsive.radiusSmall)
//
// REPLACE: BorderRadius.circular(AppDimensions.radiusMedium)
// WITH:    BorderRadius.circular(responsive.radiusMedium)
//
// REPLACE: BorderRadius.circular(AppDimensions.radiusLarge)
// WITH:    BorderRadius.circular(responsive.radiusLarge)
//
// REPLACE: BorderRadius.circular(4)
// WITH:    BorderRadius.circular(responsive.radiusSmall)
//
// REPLACE: BorderRadius.circular(8)
// WITH:    BorderRadius.circular(responsive.radiusMedium)
//
// REPLACE: BorderRadius.circular(12)
// WITH:    BorderRadius.circular(responsive.radiusLarge)

// ============================================================================
// STEP 6: Replace Icon sizes
// ============================================================================
// REPLACE: size: AppDimensions.iconSizeSmall
// WITH:    size: responsive.iconSizeSmall
//
// REPLACE: size: AppDimensions.iconSizeMedium
// WITH:    size: responsive.iconSizeMedium
//
// REPLACE: size: AppDimensions.iconSizeLarge
// WITH:    size: responsive.iconSizeLarge
//
// REPLACE: size: 16
// WITH:    size: responsive.iconSizeSmall
//
// REPLACE: size: 20
// WITH:    size: responsive.iconSizeSmall
//
// REPLACE: size: 24
// WITH:    size: responsive.iconSizeMedium
//
// REPLACE: size: 28
// WITH:    size: responsive.iconSizeMedium
//
// REPLACE: size: 32
// WITH:    size: responsive.iconSizeLarge
//
// REPLACE: size: 48
// WITH:    size: responsive.iconSizeXLarge

// ============================================================================
// STEP 7: Replace font sizes
// ============================================================================
// REPLACE: fontSize: 12
// WITH:    fontSize: responsive.fontSizeSmall
//
// REPLACE: fontSize: 14
// WITH:    fontSize: responsive.fontSizeMedium
//
// REPLACE: fontSize: 16
// WITH:    fontSize: responsive.fontSizeLarge
//
// REPLACE: fontSize: 18
// WITH:    fontSize: responsive.fontSizeLarge
//
// REPLACE: fontSize: 20
// WITH:    fontSize: responsive.fontSizeXLarge
//
// REPLACE: fontSize: 24
// WITH:    fontSize: responsive.fontSizeXXLarge
//
// REPLACE: fontSize: 28
// WITH:    fontSize: responsive.fontSizeTitle
//
// REPLACE: fontSize: 32
// WITH:    fontSize: responsive.fontSizeHeading

// ============================================================================
// STEP 8: Add overflow protection to Column widgets
// ============================================================================
// For any Column widget with children, add:
// mainAxisSize: MainAxisSize.min,

// ============================================================================
// STEP 9: Add text overflow handling
// ============================================================================
// For any Text widget that might overflow, add:
// maxLines: 1,
// overflow: TextOverflow.ellipsis,

// ============================================================================
// STEP 10: Wrap long text in FittedBox (in constrained spaces)
// ============================================================================
// BEFORE:
// Text('Long Text', style: TextStyle(...))
//
// AFTER:
// FittedBox(
//   fit: BoxFit.scaleDown,
//   child: Text(
//     'Long Text',
//     style: TextStyle(...),
//     maxLines: 1,
//     overflow: TextOverflow.ellipsis,
//   ),
// )

// ============================================================================
// STEP 11: Update GridView childAspectRatio
// ============================================================================
// BEFORE:
// childAspectRatio: 1.2,
//
// AFTER:
// childAspectRatio: responsive.byDevice(
//   mobile: 1.3,
//   tablet: 1.4,
//   desktop: 1.5,
// ),

// ============================================================================
// STEP 12: Update GridView crossAxisCount
// ============================================================================
// BEFORE:
// crossAxisCount: 2,
//
// AFTER:
// crossAxisCount: responsive.gridColumnCount,

// ============================================================================
// STEP 13: Replace any hardcoded widths/heights with percentage
// ============================================================================
// EXAMPLES:
// width: 200  ->  width: responsive.wp(50)   // 50% of screen width
// height: 100 ->  height: responsive.hp(15)  // 15% of screen height

// ============================================================================
// EXAMPLE COMPLETE BEFORE/AFTER
// ============================================================================

/*
BEFORE (Static, causes overflow):
-----------------------------------
Widget build(BuildContext context) {
  return Container(
    padding: const EdgeInsets.all(AppDimensions.paddingMedium),
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
    ),
    child: Column(
      children: [
        Icon(Icons.home, size: AppDimensions.iconSizeMedium),
        const SizedBox(height: AppDimensions.paddingSmall),
        Text(
          'Title',
          style: TextStyle(fontSize: 16),
        ),
      ],
    ),
  );
}

AFTER (Responsive, no overflow):
---------------------------------
Widget build(BuildContext context) {
  final responsive = ResponsiveSize(context);  // ADD THIS
  
  return Container(
    padding: EdgeInsets.all(responsive.paddingMedium),  // REMOVE const
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(responsive.radiusLarge),
    ),
    child: Column(
      mainAxisSize: MainAxisSize.min,  // ADD THIS
      children: [
        Icon(Icons.home, size: responsive.iconSizeMedium),
        SizedBox(height: responsive.paddingSmall),  // REMOVE const
        FittedBox(  // WRAP in FittedBox for overflow protection
          fit: BoxFit.scaleDown,
          child: Text(
            'Title',
            style: TextStyle(fontSize: responsive.fontSizeLarge),
            maxLines: 1,  // ADD THIS
            overflow: TextOverflow.ellipsis,  // ADD THIS
          ),
        ),
      ],
    ),
  );
}
*/

// ============================================================================
// FILES TO UPDATE (In order of priority)
// ============================================================================

// WIDGETS (High Priority):
// ✅ custom_app_bar.dart - DONE
// ✅ app_drawer.dart - DONE
// ❌ member_card.dart
// ❌ event_card.dart
// ❌ first_timer_card.dart
// ❌ family_card.dart
// ❌ group_card.dart
// ❌ sync_dialog.dart
// ❌ domain_config_dialog.dart

// SCREENS (High Priority):
// ✅ dashboard_screen.dart - DONE
// ❌ first_timers_screen.dart
// ❌ members_screen.dart
// ❌ events_screen.dart
// ❌ groups_screen.dart
// ❌ families_screen.dart
// ❌ visitors_screen.dart
// ❌ settings_screen.dart
// ❌ login_screen.dart
// ❌ scanner_screen.dart
// ❌ member_profile_screen.dart
// ❌ add_first_timer_screen.dart

void main() {
  print('This is a documentation file. Apply patterns manually or use find-replace.');
}
