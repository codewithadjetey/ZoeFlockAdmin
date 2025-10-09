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
  String _overallStatus = 'Choose sync operation';
  String? _currentOperation;
  int _currentStep = 0; // 0 = selection, 1 = pull, 2 = push

  @override
  void initState() {
    super.initState();
    _initializeProgress();
    _syncService.progressStream.listen(_onProgressUpdate);
  }

  void _initializeProgress() {
    // Pull Data categories
    _progressMap['Groups'] = SyncProgress(
      category: 'Groups',
      total: 0,
      synced: 0,
      status: 'Waiting...',
      currentPage: 1,
      totalPages: 1,
    );
    _progressMap['Families'] = SyncProgress(
      category: 'Families',
      total: 0,
      synced: 0,
      status: 'Waiting...',
      currentPage: 1,
      totalPages: 1,
    );
    _progressMap['Members'] = SyncProgress(
      category: 'Members',
      total: 0,
      synced: 0,
      status: 'Waiting...',
      currentPage: 1,
      totalPages: 1,
    );
    _progressMap['Events'] = SyncProgress(
      category: 'Events',
      total: 0,
      synced: 0,
      status: 'Waiting...',
      currentPage: 1,
      totalPages: 1,
    );
    // Push Data categories
    _progressMap['Offline Attendance'] = SyncProgress(
      category: 'Offline Attendance',
      total: 0,
      synced: 0,
      status: 'Waiting...',
      currentPage: 1,
      totalPages: 1,
    );
    _progressMap['First Timers'] = SyncProgress(
      category: 'First Timers',
      total: 0,
      synced: 0,
      status: 'Waiting...',
      currentPage: 1,
      totalPages: 1,
    );
  }

  void _onProgressUpdate(SyncProgress progress) {
    if (mounted) {
      setState(() {
        _progressMap[progress.category] = progress;
        
        // Update overall status based on current operation
        if (progress.hasError) {
          _overallStatus = 'Error: ${progress.error}';
        } else if (progress.isComplete) {
          if (_currentOperation == 'pull') {
            _overallStatus = 'Pull data completed successfully';
          } else if (_currentOperation == 'push') {
            _overallStatus = 'Push attendance completed successfully';
          } else {
            _overallStatus = 'Sync completed successfully';
          }
        } else {
          _overallStatus = '${_currentOperation == 'pull' ? 'Pulling' : _currentOperation == 'push' ? 'Pushing' : 'Syncing'} ${progress.category.toLowerCase()}...';
        }
      });
    }
  }

  Future<void> _startPullData() async {
    if (_isSyncing || _syncService.isSyncing) {
      print('SyncDialog: Cannot start pull data - sync already in progress');
      AppHelpers.showErrorSnackBar(context, 'Sync operation already in progress');
      return;
    }

    setState(() {
      _isSyncing = true;
      _currentOperation = 'pull';
      _currentStep = 1; // Move to pull view
      _overallStatus = 'Starting pull data...';
      _initializeProgress();
    });

    try {
      final success = await _syncService.pullData();
      
      if (mounted) {
        if (success) {
          _overallStatus = 'Pull data completed successfully';
          AppHelpers.showSuccessSnackBar(context, 'Data pulled successfully');
          
          // After pull completes, wait a moment then move to push view
          await Future.delayed(const Duration(seconds: 1));
          if (mounted) {
            setState(() {
              _currentStep = 2; // Move to push view
              _overallStatus = 'Ready to push data';
            });
          }
        } else {
          _overallStatus = 'Pull data failed';
          AppHelpers.showErrorSnackBar(context, 'Pull data failed. Please try again.');
        }
      }
    } catch (e) {
      if (mounted) {
        _overallStatus = 'Pull data failed: ${e.toString()}';
        AppHelpers.showErrorSnackBar(context, 'Pull data failed: ${e.toString()}');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSyncing = false;
          _currentOperation = null;
        });
      }
    }
  }

  Future<void> _startPushAttendance() async {
    if (_isSyncing || _syncService.isSyncing) {
      print('SyncDialog: Cannot start push attendance - sync already in progress');
      AppHelpers.showErrorSnackBar(context, 'Sync operation already in progress');
      return;
    }

    setState(() {
      _isSyncing = true;
      _currentOperation = 'push';
      if (_currentStep != 2) {
        _currentStep = 2; // Move to push view if not already there
      }
      _overallStatus = 'Starting push attendance...';
      _initializeProgress();
    });

    try {
      final success = await _syncService.pushAttendance();
      
      if (mounted) {
        if (success) {
          _overallStatus = 'Push attendance completed successfully';
          AppHelpers.showSuccessSnackBar(context, 'Attendance pushed successfully');
        } else {
          _overallStatus = 'Push attendance failed';
          AppHelpers.showErrorSnackBar(context, 'Push attendance failed. Please try again.');
        }
      }
    } catch (e) {
      if (mounted) {
        _overallStatus = 'Push attendance failed: ${e.toString()}';
        AppHelpers.showErrorSnackBar(context, 'Push attendance failed: ${e.toString()}');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSyncing = false;
          _currentOperation = null;
        });
      }
    }
  }

  Future<void> _startFullSync() async {
    if (_isSyncing || _syncService.isSyncing) {
      print('SyncDialog: Cannot start full sync - sync already in progress');
      AppHelpers.showErrorSnackBar(context, 'Sync operation already in progress');
      return;
    }

    // Start with pull data
    await _startPullData();
    
    // After pull completes, if successful, automatically start push
    if (mounted && _currentStep == 2) {
      await Future.delayed(const Duration(milliseconds: 500));
      if (mounted) {
        await _startPushAttendance();
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
        constraints: BoxConstraints(
          maxWidth: 500,
          maxHeight: MediaQuery.of(context).size.height * 0.9,
        ),
        padding: const EdgeInsets.all(AppDimensions.paddingLarge),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Icon(
                  _currentStep == 1 ? Icons.cloud_download : 
                  _currentStep == 2 ? Icons.cloud_upload : Icons.sync,
                  color: AppColors.primaryBlue,
                  size: 28,
                ),
                const SizedBox(width: AppDimensions.paddingMedium),
                Expanded(
                  child: Text(
                    _currentStep == 1 ? 'Pull Data' :
                    _currentStep == 2 ? 'Push Data' : 'Sync Operations',
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
            
            // Step 0: Selection view
            if (_currentStep == 0) ...[
              _buildSyncOperationButtons(),
              const SizedBox(height: AppDimensions.paddingLarge),
            ],
            
            // Step 1: Pull view
            if (_currentStep == 1) ...[
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionHeader('Pull Data', 'Downloading latest data from server', Icons.cloud_download),
                      _buildProgressItem(_progressMap['Groups']!),
                      _buildProgressItem(_progressMap['Families']!),
                      _buildProgressItem(_progressMap['Members']!),
                      _buildProgressItem(_progressMap['Events']!),
                    ],
                  ),
                ),
              ),
            ],
            
            // Step 2: Push view
            if (_currentStep == 2) ...[
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionHeader('Push Data', 'Uploading attendance records to server', Icons.cloud_upload),
                      _buildProgressItem(_progressMap['Offline Attendance']!),
                      _buildProgressItem(_progressMap['First Timers']!),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppDimensions.paddingLarge),
              if (!_isSyncing) ...[
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _startPushAttendance,
                    icon: const Icon(Icons.cloud_upload),
                    label: const Text('Start Push'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.gold,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
                      ),
                    ),
                  ),
                ),
              ],
            ],
            
            const SizedBox(height: AppDimensions.paddingMedium),
            
            // Navigation and action buttons
            Row(
              children: [
                if (_currentStep > 0 && !_isSyncing)
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        setState(() {
                          _currentStep = _currentStep - 1;
                          _overallStatus = _currentStep == 0 ? 'Choose sync operation' : 'Ready';
                          _initializeProgress();
                        });
                      },
                      icon: const Icon(Icons.arrow_back),
                      label: const Text('Back'),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.mediumGray),
                        foregroundColor: AppColors.mediumGray,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
                        ),
                      ),
                    ),
                  ),
                if (_currentStep > 0 && !_isSyncing)
                  const SizedBox(width: AppDimensions.paddingMedium),
                Expanded(
                  child: OutlinedButton(
                    onPressed: _closeDialog,
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.mediumGray),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
                      ),
                    ),
                    child: const Text('Close'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncOperationButtons() {
    final isAnySyncRunning = _isSyncing || _syncService.isSyncing;
    
    return Column(
      children: [
        // Pull Data Button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: isAnySyncRunning ? null : _startPullData,
            icon: const Icon(Icons.cloud_download),
            label: const Text('Pull Data'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryBlue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
              ),
            ),
          ),
        ),
        
        const SizedBox(height: AppDimensions.paddingMedium),
        
        // Push Attendance Button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: isAnySyncRunning ? null : _startPushAttendance,
            icon: const Icon(Icons.cloud_upload),
            label: const Text('Push Attendance'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.gold,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
              ),
            ),
          ),
        ),
        
        const SizedBox(height: AppDimensions.paddingMedium),
        
        // Full Sync Button
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: isAnySyncRunning ? null : _startFullSync,
            icon: const Icon(Icons.sync),
            label: const Text('Full Sync (Pull + Push)'),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.primaryBlue),
              foregroundColor: AppColors.primaryBlue,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title, String subtitle, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppDimensions.paddingMedium),
      padding: const EdgeInsets.all(AppDimensions.paddingMedium),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainer,
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
        border: Border.all(color: AppColors.lightGray),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primaryBlue, size: 20),
          const SizedBox(width: AppDimensions.paddingSmall),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryBlue,
                  ),
                ),
                Text(
                  subtitle,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.mediumGray,
                  ),
                ),
              ],
            ),
          ),
        ],
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
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${progress.synced}/${progress.total}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.mediumGray,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    if ((progress.totalPages ?? 1) > 1)
                      Text(
                        '${progress.totalPages ?? 1} pages',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.mediumGray,
                          fontSize: 10,
                        ),
                      ),
                  ],
                ),
            ],
          ),
          
          const SizedBox(height: AppDimensions.paddingSmall),
          
          // Status text
          Text(
            progress.status,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: hasError ? AppColors.error : AppColors.mediumGray,
            ),
          ),
          
          // Progress bar
          if (progress.total > 0 && !isComplete && !hasError) ...[
            const SizedBox(height: AppDimensions.paddingSmall),
            LinearProgressIndicator(
              value: progress.progress,
              backgroundColor: AppColors.lightGray,
              valueColor: AlwaysStoppedAnimation<Color>(statusColor),
            ),
          ],
          
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
}
