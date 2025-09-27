import 'package:flutter/material.dart';
import '../utils/constants.dart';

class FamilyCard extends StatelessWidget {
  final String name;
  final String? description;
  final String? address;
  final String? phone;
  final String? email;
  final String? headOfFamilyName;
  final int memberCount;
  final bool isActive;
  final VoidCallback? onTap;

  const FamilyCard({
    super.key,
    required this.name,
    this.description,
    this.address,
    this.phone,
    this.email,
    this.headOfFamilyName,
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Row
              Row(
                children: [
                  // Family Icon
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: AppColors.primaryBlue,
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: const Icon(
                      Icons.family_restroom,
                      color: AppColors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: AppDimensions.paddingMedium),
                  
                  // Family Name and Status
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: isActive ? AppColors.onSurface : AppColors.mediumGray,
                          ),
                        ),
                        
                        const SizedBox(height: AppDimensions.paddingSmall / 2),
                        
                        Row(
                          children: [
                            // Member Count
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
                            
                            const SizedBox(width: AppDimensions.paddingSmall),
                            
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
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  // Arrow Icon
                  Icon(
                    Icons.arrow_forward_ios,
                    size: 16,
                    color: AppColors.mediumGray,
                  ),
                ],
              ),
              
              // Description
              if (description != null && description!.isNotEmpty) ...[
                const SizedBox(height: AppDimensions.paddingSmall),
                Text(
                  description!,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.onSurfaceVariant,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              
              // Family Details
              const SizedBox(height: AppDimensions.paddingSmall),
              
              Row(
                children: [
                  // Head of Family
                  if (headOfFamilyName != null && headOfFamilyName!.isNotEmpty) ...[
                    Icon(
                      Icons.person,
                      size: 16,
                      color: AppColors.onSurfaceVariant,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      headOfFamilyName!,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.onSurfaceVariant,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: AppDimensions.paddingSmall),
                  ],
                  
                  // Phone
                  if (phone != null && phone!.isNotEmpty) ...[
                    Icon(
                      Icons.phone,
                      size: 16,
                      color: AppColors.onSurfaceVariant,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      phone!,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(width: AppDimensions.paddingSmall),
                  ],
                  
                  // Email
                  if (email != null && email!.isNotEmpty) ...[
                    Icon(
                      Icons.email,
                      size: 16,
                      color: AppColors.onSurfaceVariant,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      email!,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ],
              ),
              
              // Address
              if (address != null && address!.isNotEmpty) ...[
                const SizedBox(height: AppDimensions.paddingSmall / 2),
                Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      size: 16,
                      color: AppColors.onSurfaceVariant,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        address!,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.onSurfaceVariant,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
