import 'package:flutter/material.dart';
import '../models/event.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';

class EventCard extends StatelessWidget {
  final Event event;
  final VoidCallback? onTap;
  final VoidCallback? onAttendanceCountTap;
  final bool showAttendanceCount;

  const EventCard({
    super.key,
    required this.event,
    this.onTap,
    this.onAttendanceCountTap,
    this.showAttendanceCount = true,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      color: AppColors.surfaceContainer,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.paddingMedium),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(context),
              const SizedBox(height: AppDimensions.paddingSmall),
              _buildEventDetails(context),
              if (showAttendanceCount && event.attendanceCount != null) ...[
                const SizedBox(height: AppDimensions.paddingMedium),
                _buildAttendanceCount(context),
              ],
              const SizedBox(height: AppDimensions.paddingSmall),
              _buildFooter(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            event.title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.primaryBlue,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: AppDimensions.paddingSmall),
        _buildStatusChip(context),
      ],
    );
  }

  Widget _buildStatusChip(BuildContext context) {
    Color chipColor;
    String statusText;
    
    if (event.isActive) {
      chipColor = AppColors.success;
      statusText = 'Active';
    } else if (event.isUpcoming) {
      chipColor = AppColors.warning;
      statusText = 'Upcoming';
    } else {
      chipColor = AppColors.mediumGray;
      statusText = 'Past';
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.paddingSmall,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: chipColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(AppDimensions.radiusSmall),
      ),
      child: Text(
        statusText,
        style: TextStyle(
          color: chipColor,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildEventDetails(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (event.description != null && event.description!.isNotEmpty) ...[
          Text(
            event.description!,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.mediumGray,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: AppDimensions.paddingSmall),
        ],
        _buildDetailRow(
          context,
          Icons.calendar_today,
          AppHelpers.formatDate(event.startDate),
        ),
        if (event.time != null)
          _buildDetailRow(
            context,
            Icons.access_time,
            event.time!,
          ),
        if (event.location != null)
          _buildDetailRow(
            context,
            Icons.location_on,
            event.location!,
          ),
      ],
    );
  }

  Widget _buildDetailRow(BuildContext context, IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Icon(
            icon,
            size: 16,
            color: AppColors.mediumGray,
          ),
          const SizedBox(width: AppDimensions.paddingSmall),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.mediumGray,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAttendanceCount(BuildContext context) {
    return GestureDetector(
      onTap: onAttendanceCountTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppDimensions.paddingMedium,
          vertical: AppDimensions.paddingSmall,
        ),
        decoration: BoxDecoration(
          color: AppColors.primaryBlue.withOpacity(0.1),
          borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
          border: Border.all(
            color: AppColors.primaryBlue.withOpacity(0.3),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.people,
              size: 16,
              color: AppColors.primaryBlue,
            ),
            const SizedBox(width: AppDimensions.paddingSmall),
            Text(
              '${event.attendanceCount} ${AppStrings.attendanceCount}',
              style: TextStyle(
                color: AppColors.primaryBlue,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Row(
      children: [
        Text(
          event.formattedDate,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: AppColors.mediumGray,
            fontWeight: FontWeight.w500,
          ),
        ),
        const Spacer(),
        if (event.isToday)
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppDimensions.paddingSmall,
              vertical: 2,
            ),
            decoration: BoxDecoration(
              color: AppColors.success,
              borderRadius: BorderRadius.circular(AppDimensions.radiusSmall),
            ),
            child: const Text(
              'TODAY',
              style: TextStyle(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
      ],
    );
  }
}
