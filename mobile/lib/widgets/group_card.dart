import 'package:flutter/material.dart';
import '../utils/constants.dart';

class GroupCard extends StatelessWidget {
  final String name;
  final String? description;
  final String? color;
  final String? icon;
  final String? leaderName;
  final int memberCount;
  final bool isActive;
  final VoidCallback? onTap;

  const GroupCard({
    super.key,
    required this.name,
    this.description,
    this.color,
    this.icon,
    this.leaderName,
    this.memberCount = 0,
    this.isActive = true,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppDimensions.paddingMedium),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.paddingMedium),
          child: Row(
            children: [
              // Group Icon/Avatar
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: _getGroupColor(),
                  borderRadius: BorderRadius.circular(25),
                ),
                child: Icon(
                  _getGroupIcon(),
                  color: AppColors.white,
                  size: 24,
                ),
              ),
              const SizedBox(width: AppDimensions.paddingMedium),
              
              // Group Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Group Name
                    Text(
                      name,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: isActive ? AppColors.onSurface : AppColors.mediumGray,
                      ),
                    ),
                    
                    // Description
                    if (description != null && description!.isNotEmpty) ...[
                      const SizedBox(height: AppDimensions.paddingSmall / 2),
                      Text(
                        description!,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.onSurfaceVariant,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    
                    const SizedBox(height: AppDimensions.paddingSmall / 2),
                    
                    // Leader and Member Count
                    Row(
                      children: [
                        if (leaderName != null && leaderName!.isNotEmpty) ...[
                          Icon(
                            Icons.person,
                            size: 14,
                            color: AppColors.onSurfaceVariant,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            leaderName!,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.onSurfaceVariant,
                            ),
                          ),
                          const SizedBox(width: AppDimensions.paddingSmall),
                        ],
                        
                        Icon(
                          Icons.people,
                          size: 14,
                          color: AppColors.onSurfaceVariant,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '$memberCount member${memberCount != 1 ? 's' : ''}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              // Status and Arrow
              Column(
                children: [
                  // Active Status
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppDimensions.paddingSmall,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: isActive ? AppColors.success : AppColors.mediumGray,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      isActive ? 'Active' : 'Inactive',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: AppDimensions.paddingSmall),
                  
                  // Arrow Icon
                  Icon(
                    Icons.arrow_forward_ios,
                    size: 16,
                    color: AppColors.mediumGray,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getGroupColor() {
    if (color != null && color!.isNotEmpty) {
      try {
        // Try to parse hex color
        return Color(int.parse(color!.replaceFirst('#', '0xFF')));
      } catch (e) {
        // Fallback to default colors
      }
    }
    
    // Default colors based on group name
    final colors = [
      AppColors.primaryBlue,
      AppColors.success,
      AppColors.warning,
      AppColors.error,
      AppColors.gold,
    ];
    
    final index = name.hashCode % colors.length;
    return colors[index.abs()];
  }

  IconData _getGroupIcon() {
    if (icon != null && icon!.isNotEmpty) {
      // Map common icon names to Material icons
      switch (icon!.toLowerCase()) {
        case 'youth':
          return Icons.child_care;
        case 'children':
          return Icons.child_friendly;
        case 'adults':
          return Icons.people;
        case 'seniors':
          return Icons.elderly;
        case 'women':
          return Icons.woman;
        case 'men':
          return Icons.man;
        case 'music':
          return Icons.music_note;
        case 'prayer':
          return Icons.favorite;
        case 'bible':
          return Icons.menu_book;
        case 'service':
          return Icons.volunteer_activism;
        default:
          return Icons.group;
      }
    }
    
    // Default icon
    return Icons.group;
  }
}
