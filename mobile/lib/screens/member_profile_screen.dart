import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/attendance_provider.dart';
import '../providers/event_provider.dart';
import '../models/member.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../widgets/custom_app_bar.dart';

class MemberProfileScreen extends StatefulWidget {
  final Member member;
  final VoidCallback? onAttendanceMarked;

  const MemberProfileScreen({
    super.key,
    required this.member,
    this.onAttendanceMarked,
  });

  @override
  State<MemberProfileScreen> createState() => _MemberProfileScreenState();
}

class _MemberProfileScreenState extends State<MemberProfileScreen> {
  final TextEditingController _notesController = TextEditingController();
  bool _isFirstTimer = false;
  bool _isMarkingAttendance = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _markAttendance() async {
    if (_isMarkingAttendance) return;

    setState(() {
      _isMarkingAttendance = true;
    });

    try {
      final attendanceProvider = Provider.of<AttendanceProvider>(context, listen: false);
      final eventProvider = Provider.of<EventProvider>(context, listen: false);
      
      if (eventProvider.selectedEvent == null) {
        AppHelpers.showErrorSnackBar(context, 'No event selected');
        return;
      }

      final response = await attendanceProvider.scanMemberId(
        barcode: widget.member.memberIdentificationId,
        eventId: eventProvider.selectedEvent!.id,
        notes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
      );

      if (response.isSuccess) {
        if (mounted) {
          AppHelpers.showSuccessSnackBar(context, AppStrings.successMessage);
          
          // Show success animation
          _showSuccessAnimation();
          
          // Call callback
          widget.onAttendanceMarked?.call();
          
          // Navigate back after a delay
          Future.delayed(const Duration(seconds: 2), () {
            if (mounted) {
              Navigator.of(context).pop();
            }
          });
        }
      } else {
        if (mounted) {
          AppHelpers.showErrorSnackBar(context, response.errorMessage);
        }
      }
    } catch (e) {
      if (mounted) {
        AppHelpers.showErrorSnackBar(context, 'Failed to mark attendance: ${e.toString()}');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isMarkingAttendance = false;
        });
      }
    }
  }

  void _showSuccessAnimation() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(AppDimensions.paddingLarge),
          decoration: BoxDecoration(
            color: AppColors.surfaceContainer,
            borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.check_circle,
                color: AppColors.success,
                size: 64,
              ),
              const SizedBox(height: AppDimensions.paddingMedium),
              Text(
                'Attendance Marked!',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: AppColors.success,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppDimensions.paddingSmall),
              Text(
                '${widget.member.fullName} has been marked as present',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: AppStrings.memberProfileTitle,
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          children: [
            _buildMemberCard(),
            const SizedBox(height: AppDimensions.paddingMedium),
            _buildAttendanceForm(),
            const SizedBox(height: AppDimensions.paddingLarge),
            _buildActionButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildMemberCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.paddingLarge),
        child: Column(
          children: [
            // Profile image
            CircleAvatar(
              radius: 50,
              backgroundColor: AppColors.primaryBlue,
              backgroundImage: widget.member.profileImagePath != null
                  ? NetworkImage(AppHelpers.getImageUrl(widget.member.profileImagePath!))
                  : null,
              child: widget.member.profileImagePath == null
                  ? Text(
                      widget.member.initials,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    )
                  : null,
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            
            // Member name
            Text(
              widget.member.fullName,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primaryBlue,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppDimensions.paddingSmall),
            
            // Member ID
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppDimensions.paddingMedium,
                vertical: AppDimensions.paddingSmall,
              ),
              decoration: BoxDecoration(
                color: AppColors.primaryBlue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
              ),
              child: Text(
                AppHelpers.formatMemberId(widget.member.memberIdentificationId),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontFamily: 'monospace',
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            
            // Member details
            _buildDetailRow(Icons.email, 'Email', widget.member.email),
            if (widget.member.group != null)
              _buildDetailRow(Icons.group, 'Group', widget.member.group!),
            if (widget.member.family != null)
              _buildDetailRow(Icons.family_restroom, 'Family', widget.member.family!),
            if (widget.member.gender != null)
              _buildDetailRow(Icons.person, 'Gender', widget.member.gender!),
            if (widget.member.lastAttendanceDate != null)
              _buildDetailRow(
                Icons.schedule,
                'Last Attendance',
                AppHelpers.formatDate(widget.member.lastAttendanceDate!),
              ),
            
            // Status indicator
            const SizedBox(height: AppDimensions.paddingMedium),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppDimensions.paddingMedium,
                vertical: AppDimensions.paddingSmall,
              ),
              decoration: BoxDecoration(
                color: widget.member.isActive ? AppColors.success : AppColors.error,
                borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
              ),
              child: Text(
                widget.member.status.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppDimensions.paddingSmall),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.mediumGray),
          const SizedBox(width: AppDimensions.paddingSmall),
          Text(
            '$label: ',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
              color: AppColors.mediumGray,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAttendanceForm() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.paddingLarge),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Attendance Details',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            
            // Notes field
            TextField(
              controller: _notesController,
              decoration: InputDecoration(
                labelText: 'Notes (Optional)',
                hintText: 'Add any special notes...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
                ),
                prefixIcon: const Icon(Icons.note),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            
            // First timer checkbox
            Row(
              children: [
                Checkbox(
                  value: _isFirstTimer,
                  onChanged: (value) {
                    setState(() {
                      _isFirstTimer = value ?? false;
                    });
                  },
                  activeColor: AppColors.primaryBlue,
                ),
                const Text('Mark as First Timer'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: _isMarkingAttendance ? null : () => Navigator.of(context).pop(),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
              ),
            ),
            child: Text(
              AppStrings.cancel,
              style: const TextStyle(fontSize: 16),
            ),
          ),
        ),
        const SizedBox(width: AppDimensions.paddingMedium),
        Expanded(
          flex: 2,
          child: ElevatedButton(
            onPressed: _isMarkingAttendance ? null : _markAttendance,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
              ),
            ),
            child: _isMarkingAttendance
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : Text(
                    AppStrings.markPresent,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
          ),
        ),
      ],
    );
  }
}
