import 'package:flutter/material.dart';
import '../utils/constants.dart';
import '../utils/responsive_size.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final dynamic title; // Can be String or Widget
  final List<Widget>? actions;
  final Widget? leading;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final bool centerTitle;
  final double elevation;

  const CustomAppBar({
    super.key,
    required this.title,
    this.actions,
    this.leading,
    this.backgroundColor,
    this.foregroundColor,
    this.centerTitle = true,
    this.elevation = 0,
  });

  @override
  Widget build(BuildContext context) {
    final responsive = ResponsiveSize(context);
    
    return AppBar(
      title: title is String 
          ? Text(
              title,
              style: TextStyle(
                color: foregroundColor ?? Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: responsive.fontSizeXLarge,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            )
          : title as Widget,
      actions: actions,
      leading: leading,
      backgroundColor: backgroundColor ?? AppColors.primaryBlue,
      foregroundColor: foregroundColor ?? Colors.white,
      centerTitle: centerTitle,
      elevation: elevation,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(responsive.radiusLarge),
        ),
      ),
      toolbarHeight: responsive.scale(kToolbarHeight),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight);
}

