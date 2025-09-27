import 'package:flutter/material.dart';
import '../services/sync_service.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';

class SyncDialog extends StatefulWidget {
  const SyncDialog({super.key});

  @override
  State<SyncDialog> createState() => _SyncDialogState();
}

class _SyncDialogState extends State<SyncDialog> {
  final SyncService _syncService = SyncService();
  final Map<String, SyncProgress> _progressMap = {};
  bool _isSyncing = false;
  String _overallStatus = 'Ready to sync';

  @override
  void initState() {
    super.initState();
    _initializeProgress();
    _syncService.progressStream.listen(_onProgressUpdate);
  }

  void _initializeProgress() {
    _progressMap['Groups'] = SyncProgress(
      category: 'Groups',
      total: 0,
      synced: 0,
      status: 'Waiting...',
    );
    _progressMap['Families'] = SyncProgress(
      category: 'Families',
      total: 0,
      synced: 0,
      status: 'Waiting...',
    );
    _progressMap['Members'] = SyncProgress(
      category: 'Members',
      total: 0,
      synced: 0,
      status: 'Waiting...',
    );
    _progressMap['Events'] = SyncProgress(
      category: 'Events',
      total: 0,
      synced: 0,
      status: 'Waiting...',
    );
  }

  void _onProgressUpdate(SyncProgress progress) {
    if (mounted) {
      setState(() {
        _progressMap[progress.category] = progress;
        
        // Update overall status
        if (progress.hasError) {
          _overallStatus = 'Error: ${progress.error}';
        } else if (progress.isComplete) {
          _overallStatus = 'Sync completed successfully';
        } else {
          _overallStatus = 'Syncing ${progress.category.toLowerCase()}...';
        }
      });
    }
  }

  Future<void> _startSync() async {
    if (_isSyncing) return;

    setState(() {
      _isSyncing = true;
      _overallStatus = 'Starting sync...';
      _initializeProgress();
    });

    try {
      final success = await _syncService.syncAllData();
      
      if (mounted) {
        if (success) {
          _overallStatus = 'Sync completed successfully';
          AppHelpers.showSuccessSnackBar(context, 'Data synced successfully');
        } else {
          _overallStatus = 'Sync failed';
          AppHelpers.showErrorSnackBar(context, 'Sync failed. Please try again.');
        }
      }
    } catch (e) {
      if (mounted) {
        _overallStatus = 'Sync error: ${e.toString()}';
        AppHelpers.showErrorSnackBar(context, 'Sync error: ${e.toString()}');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSyncing = false;
        });
      }
    }
  }

  void _closeDialog() {
    if (!_isSyncing) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400, maxHeight: 600),
        padding: const EdgeInsets.all(AppDimensions.paddingLarge),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Icon(
                  Icons.sync,
                  color: AppColors.primaryBlue,
                  size: 28,
                ),
                const SizedBox(width: AppDimensions.paddingMedium),
                Expanded(
                  child: Text(
                    'Sync Data',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryBlue,
                    ),
                  ),
                ),
                if (!_isSyncing)
                  IconButton(
                    onPressed: _closeDialog,
                    icon: const Icon(Icons.close),
                    color: AppColors.mediumGray,
                  ),
              ],
            ),
            
            const SizedBox(height: AppDimensions.paddingMedium),
            
            // Overall status
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppDimensions.paddingMedium),
              decoration: BoxDecoration(
                color: AppColors.lightGray,
                borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
              ),
              child: Text(
                _overallStatus,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            
            const SizedBox(height: AppDimensions.paddingLarge),
            
            // Progress items
            ..._progressMap.values.map((progress) => _buildProgressItem(progress)),
            
            const SizedBox(height: AppDimensions.paddingLarge),
            
            // Action buttons
            Row(
              children: [
                if (!_isSyncing) ...[
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _closeDialog,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.mediumGray),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
                        ),
                      ),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: AppDimensions.paddingMedium),
                ],
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isSyncing ? null : _startSync,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryBlue,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
                      ),
                    ),
                    child: _isSyncing
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('Start Sync'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressItem(SyncProgress progress) {
    final isActive = progress.status != 'Waiting...' && !progress.isComplete;
    final hasError = progress.hasError;
    final isComplete = progress.isComplete;
    
    Color statusColor = AppColors.mediumGray;
    IconData statusIcon = Icons.pending;
    
    if (hasError) {
      statusColor = AppColors.error;
      statusIcon = Icons.error;
    } else if (isComplete) {
      statusColor = AppColors.success;
      statusIcon = Icons.check_circle;
    } else if (isActive) {
      statusColor = AppColors.primaryBlue;
      statusIcon = Icons.sync;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: AppDimensions.paddingMedium),
      padding: const EdgeInsets.all(AppDimensions.paddingMedium),
      decoration: BoxDecoration(
        color: hasError ? AppColors.error.withOpacity(0.1) : AppColors.lightGray,
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
        border: Border.all(
          color: hasError ? AppColors.error : Colors.transparent,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Row(
            children: [
              Icon(
                statusIcon,
                color: statusColor,
                size: 20,
              ),
              const SizedBox(width: AppDimensions.paddingSmall),
              Expanded(
                child: Text(
                  progress.category,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: statusColor,
                  ),
                ),
              ),
              if (progress.total > 0)
                Text(
                  '${progress.synced}/${progress.total}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.mediumGray,
                    fontWeight: FontWeight.w500,
                  ),
                ),
            ],
          ),
          
          const SizedBox(height: AppDimensions.paddingSmall),
          
          // Progress bar
          if (progress.total > 0) ...[
            LinearProgressIndicator(
              value: progress.progress,
              backgroundColor: AppColors.lightGray,
              valueColor: AlwaysStoppedAnimation<Color>(statusColor),
              minHeight: 4,
            ),
            const SizedBox(height: AppDimensions.paddingSmall),
          ],
          
          // Status text
          Text(
            progress.status,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: hasError ? AppColors.error : AppColors.mediumGray,
            ),
          ),
          
          // Error message
          if (hasError && progress.error != null) ...[
            const SizedBox(height: AppDimensions.paddingSmall),
            Container(
              padding: const EdgeInsets.all(AppDimensions.paddingSmall),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppDimensions.radiusSmall),
              ),
              child: Text(
                progress.error!,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.error,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}
