import 'package:flutter/material.dart';
import '../models/first_timer.dart';
import '../utils/constants.dart';

class FirstTimerCard extends StatelessWidget {
  final FirstTimer firstTimer;
  final VoidCallback onTap;

  const FirstTimerCard({
    super.key,
    required this.firstTimer,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppDimensions.paddingMedium),
      color: _getStatusColor(firstTimer.status),
      elevation: 4.0,
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
              // Header with name and status
              Row(
                children: [
                  // First Timer Icon
                  Icon(
                    _getStatusIcon(firstTimer.status),
                    color: AppColors.white,
                    size: AppDimensions.iconSizeMedium,
                  ),
                  const SizedBox(width: AppDimensions.paddingSmall),
                  // Name
                  Expanded(
                    child: Text(
                      firstTimer.name,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.white,
                      ),
                    ),
                  ),
                  // Status Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppDimensions.paddingSmall,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      firstTimer.statusDisplayName,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppDimensions.paddingMedium),

              // Phone Number
              Row(
                children: [
                  Icon(Icons.phone, size: AppDimensions.iconSizeSmall, color: AppColors.white.withOpacity(0.8)),
                  const SizedBox(width: AppDimensions.paddingSmall / 2),
                  Expanded(
                    child: Text(
                      firstTimer.primaryMobileNumber,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.white.withOpacity(0.9),
                      ),
                    ),
                  ),
                ],
              ),

              // Secondary Phone (if available)
              if (firstTimer.hasSecondaryPhone) ...[
                const SizedBox(height: AppDimensions.paddingSmall / 2),
                Row(
                  children: [
                    Icon(Icons.phone_android, size: AppDimensions.iconSizeSmall, color: AppColors.white.withOpacity(0.8)),
                    const SizedBox(width: AppDimensions.paddingSmall / 2),
                    Expanded(
                      child: Text(
                        firstTimer.secondaryPhone,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.white.withOpacity(0.9),
                        ),
                      ),
                    ),
                  ],
                ),
              ],

              // Location (if available)
              if (firstTimer.location != null && firstTimer.location!.isNotEmpty) ...[
                const SizedBox(height: AppDimensions.paddingSmall / 2),
                Row(
                  children: [
                    Icon(Icons.location_on, size: AppDimensions.iconSizeSmall, color: AppColors.white.withOpacity(0.8)),
                    const SizedBox(width: AppDimensions.paddingSmall / 2),
                    Expanded(
                      child: Text(
                        firstTimer.location!,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.white.withOpacity(0.9),
                        ),
                      ),
                    ),
                  ],
                ),
              ],

              const SizedBox(height: AppDimensions.paddingMedium),

              // Visit Count and Invited By
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Visit Count
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Visits',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.white.withOpacity(0.8),
                        ),
                      ),
                      Text(
                        firstTimer.visitCountDisplay,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w500,
                          color: AppColors.white,
                        ),
                      ),
                    ],
                  ),
                  // Invited By
                  if (firstTimer.invitedBy != null && firstTimer.invitedBy!.isNotEmpty)
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'Invited By',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.white.withOpacity(0.8),
                            ),
                          ),
                          Text(
                            firstTimer.invitedBy!,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w500,
                              color: AppColors.white,
                            ),
                            textAlign: TextAlign.end,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                ],
              ),

              // Service Feedback (if available)
              if (firstTimer.howWasService != null && firstTimer.howWasService!.isNotEmpty) ...[
                const SizedBox(height: AppDimensions.paddingMedium),
                Container(
                  padding: const EdgeInsets.all(AppDimensions.paddingSmall),
                  decoration: BoxDecoration(
                    color: AppColors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppDimensions.radiusSmall),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Service Feedback',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.white.withOpacity(0.8),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: AppDimensions.paddingSmall / 2),
                      Text(
                        firstTimer.howWasService!,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.white.withOpacity(0.9),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],

              // Would Like to Stay (if available)
              if (firstTimer.wouldLikeToStay != null) ...[
                const SizedBox(height: AppDimensions.paddingSmall),
                Row(
                  children: [
                    Icon(
                      firstTimer.wouldLikeToStay! ? Icons.favorite : Icons.favorite_border,
                      size: AppDimensions.iconSizeSmall,
                      color: firstTimer.wouldLikeToStay! ? AppColors.white : AppColors.white.withOpacity(0.6),
                    ),
                    const SizedBox(width: AppDimensions.paddingSmall / 2),
                    Text(
                      firstTimer.wouldLikeToStay! ? 'Would like to stay' : 'Not interested in staying',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: firstTimer.wouldLikeToStay! ? AppColors.white : AppColors.white.withOpacity(0.8),
                        fontWeight: firstTimer.wouldLikeToStay! ? FontWeight.w500 : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ],

              // Push Status
              const SizedBox(height: AppDimensions.paddingSmall),
              Row(
                children: [
                  Icon(
                    _getPushStatusIcon(firstTimer),
                    size: AppDimensions.iconSizeSmall,
                    color: _getPushStatusColor(firstTimer),
                  ),
                  const SizedBox(width: AppDimensions.paddingSmall / 2),
                  Text(
                    'Sync: ${firstTimer.pushStatus}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: _getPushStatusColor(firstTimer),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(FirstTimerStatus status) {
    switch (status) {
      case FirstTimerStatus.firstTimer:
        return AppColors.primaryBlue;
      case FirstTimerStatus.visitor:
        return AppColors.warning;
      case FirstTimerStatus.potentialMember:
        return AppColors.success;
    }
  }

  IconData _getStatusIcon(FirstTimerStatus status) {
    switch (status) {
      case FirstTimerStatus.firstTimer:
        return Icons.person_add;
      case FirstTimerStatus.visitor:
        return Icons.people;
      case FirstTimerStatus.potentialMember:
        return Icons.star;
    }
  }

  IconData _getPushStatusIcon(FirstTimer firstTimer) {
    if (firstTimer.isPushedToServer) {
      return Icons.cloud_done;
    } else if (firstTimer.hasPushError) {
      return Icons.cloud_off;
    } else if (firstTimer.pushAttempts > 0) {
      return Icons.cloud_sync;
    } else {
      return Icons.cloud_upload;
    }
  }

  Color _getPushStatusColor(FirstTimer firstTimer) {
    if (firstTimer.isPushedToServer) {
      return AppColors.success;
    } else if (firstTimer.hasPushError) {
      return AppColors.error;
    } else if (firstTimer.pushAttempts > 0) {
      return AppColors.warning;
    } else {
      return AppColors.mediumGray;
    }
  }
}
