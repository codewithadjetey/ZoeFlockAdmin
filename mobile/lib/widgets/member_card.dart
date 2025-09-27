import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/member.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';

class MemberCard extends StatelessWidget {
  final Member member;
  final bool compact;
  final VoidCallback? onTap;
  final bool showStatus;
  final bool showLastAttendance;

  const MemberCard({
    super.key,
    required this.member,
    this.compact = false,
    this.onTap,
    this.showStatus = true,
    this.showLastAttendance = true,
  });

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return _buildCompactCard(context);
    }
    
    return _buildFullCard(context);
  }

  Widget _buildCompactCard(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 80,
        padding: const EdgeInsets.all(AppDimensions.paddingSmall),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainer,
          borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildAvatar(context, size: 32),
            const SizedBox(height: AppDimensions.paddingSmall),
            Text(
              member.firstName,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            if (showStatus) ...[
              const SizedBox(height: 2),
              _buildStatusIndicator(context, size: 6),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildFullCard(BuildContext context) {
    return Card(
      elevation: 2,
      color: AppColors.surfaceContainer,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.paddingMedium),
          child: Row(
            children: [
              _buildAvatar(context),
              const SizedBox(width: AppDimensions.paddingMedium),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      member.fullName,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      member.email,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.mediumGray,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (member.group != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.group,
                            size: 14,
                            color: AppColors.mediumGray,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            member.group!,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.mediumGray,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ],
                    if (showLastAttendance && member.lastAttendanceDate != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.schedule,
                            size: 14,
                            color: AppColors.mediumGray,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Last: ${AppHelpers.getTimeAgo(member.lastAttendanceDate!)}',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.mediumGray,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              if (showStatus) ...[
                const SizedBox(width: AppDimensions.paddingSmall),
                _buildStatusIndicator(context),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar(BuildContext context, {double size = 48}) {
    return CircleAvatar(
      radius: size / 2,
      backgroundColor: AppColors.primaryBlue,
      backgroundImage: member.profileImagePath != null
          ? CachedNetworkImageProvider(
              AppHelpers.getImageUrl(member.profileImagePath!),
            )
          : null,
      child: member.profileImagePath == null
          ? Text(
              member.initials,
              style: TextStyle(
                fontSize: size * 0.4,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            )
          : null,
    );
  }

  Widget _buildStatusIndicator(BuildContext context, {double size = 8}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: member.isActive ? AppColors.success : AppColors.error,
        shape: BoxShape.circle,
      ),
    );
  }
}
