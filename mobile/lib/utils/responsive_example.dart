import 'package:flutter/material.dart';
import 'responsive_size.dart';
import 'constants.dart';

/// Example usage of the responsive sizing system
/// This file demonstrates various ways to use responsive dimensions

class ResponsiveExample extends StatelessWidget {
  const ResponsiveExample({super.key});

  @override
  Widget build(BuildContext context) {
    // Method 1: Using ResponsiveSize directly
    final responsive = ResponsiveSize(context);
    
    // Method 2: Using context extension
    final width50Percent = context.wp(50);
    
    // Method 3: Using ResponsiveDimensions
    final dimensions = ResponsiveDimensions(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Responsive Design Examples'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(dimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Example 1: Responsive Text
            _buildSection(
              context,
              title: 'Responsive Text Sizes',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Heading',
                    style: TextStyle(fontSize: responsive.fontSizeHeading),
                  ),
                  Text(
                    'Title',
                    style: TextStyle(fontSize: responsive.fontSizeTitle),
                  ),
                  Text(
                    'Large',
                    style: TextStyle(fontSize: responsive.fontSizeLarge),
                  ),
                  Text(
                    'Medium',
                    style: TextStyle(fontSize: responsive.fontSizeMedium),
                  ),
                  Text(
                    'Small',
                    style: TextStyle(fontSize: responsive.fontSizeSmall),
                  ),
                ],
              ),
            ),

            SizedBox(height: dimensions.paddingLarge),

            // Example 2: Percentage-based sizing
            _buildSection(
              context,
              title: 'Percentage-based Layout',
              child: Column(
                children: [
                  Container(
                    width: context.wp(100), // 100% width
                    height: context.hp(5), // 5% height
                    color: AppColors.primaryBlue,
                    alignment: Alignment.center,
                    child: const Text('100% Width, 5% Height'),
                  ),
                  SizedBox(height: dimensions.paddingSmall),
                  Row(
                    children: [
                      Container(
                        width: context.wp(48), // 48% width
                        height: context.hp(5),
                        color: AppColors.gold,
                        alignment: Alignment.center,
                        child: const Text('48%'),
                      ),
                      SizedBox(width: dimensions.paddingSmall),
                      Container(
                        width: context.wp(48), // 48% width
                        height: context.hp(5),
                        color: AppColors.success,
                        alignment: Alignment.center,
                        child: const Text('48%'),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            SizedBox(height: dimensions.paddingLarge),

            // Example 3: Device-specific layouts
            _buildSection(
              context,
              title: 'Device-specific Layout',
              child: Container(
                padding: EdgeInsets.all(dimensions.paddingMedium),
                decoration: BoxDecoration(
                  color: responsive.byDevice(
                    mobile: AppColors.primaryBlue,
                    tablet: AppColors.gold,
                    desktop: AppColors.success,
                  ),
                  borderRadius: BorderRadius.circular(dimensions.radiusMedium),
                ),
                child: Text(
                  responsive.byDevice(
                    mobile: 'Mobile Device',
                    tablet: 'Tablet Device',
                    desktop: 'Desktop Device',
                  ),
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            ),

            SizedBox(height: dimensions.paddingLarge),

            // Example 4: Responsive buttons
            _buildSection(
              context,
              title: 'Responsive Buttons',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      minimumSize: Size(double.infinity, dimensions.buttonHeightSmall),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(dimensions.radiusMedium),
                      ),
                    ),
                    child: Text(
                      'Small Button',
                      style: TextStyle(fontSize: responsive.fontSizeMedium),
                    ),
                  ),
                  SizedBox(height: dimensions.paddingSmall),
                  ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      minimumSize: Size(double.infinity, dimensions.buttonHeightMedium),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(dimensions.radiusMedium),
                      ),
                    ),
                    child: Text(
                      'Medium Button',
                      style: TextStyle(fontSize: responsive.fontSizeLarge),
                    ),
                  ),
                  SizedBox(height: dimensions.paddingSmall),
                  ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      minimumSize: Size(double.infinity, dimensions.buttonHeightLarge),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(dimensions.radiusMedium),
                      ),
                    ),
                    child: Text(
                      'Large Button',
                      style: TextStyle(fontSize: responsive.fontSizeXLarge),
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: dimensions.paddingLarge),

            // Example 5: Responsive grid
            _buildSection(
              context,
              title: 'Responsive Grid',
              child: GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: responsive.gridColumnCount,
                  crossAxisSpacing: dimensions.paddingSmall,
                  mainAxisSpacing: dimensions.paddingSmall,
                  childAspectRatio: 1.5,
                ),
                itemCount: 6,
                itemBuilder: (context, index) {
                  return Container(
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainer,
                      borderRadius: BorderRadius.circular(dimensions.radiusMedium),
                    ),
                    alignment: Alignment.center,
                    child: Text('Item ${index + 1}'),
                  );
                },
              ),
            ),

            SizedBox(height: dimensions.paddingLarge),

            // Example 6: Device info
            _buildSection(
              context,
              title: 'Device Information',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Screen Width: ${responsive.screenWidth.toStringAsFixed(0)}'),
                  Text('Screen Height: ${responsive.screenHeight.toStringAsFixed(0)}'),
                  Text('Device Type: ${responsive.deviceType.name}'),
                  Text('Orientation: ${responsive.isPortrait ? "Portrait" : "Landscape"}'),
                  Text('Is Mobile: ${responsive.isMobile}'),
                  Text('Is Tablet: ${responsive.isTablet}'),
                  Text('Grid Columns: ${responsive.gridColumnCount}'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(BuildContext context, {required String title, required Widget child}) {
    final dimensions = ResponsiveDimensions(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: ResponsiveSize(context).fontSizeXLarge,
            fontWeight: FontWeight.bold,
            color: AppColors.primaryBlue,
          ),
        ),
        SizedBox(height: dimensions.paddingSmall),
        child,
      ],
    );
  }
}
