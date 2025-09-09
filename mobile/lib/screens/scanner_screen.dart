import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import '../providers/event_provider.dart';
import '../providers/attendance_provider.dart';
import '../models/member.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../utils/validators.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/member_card.dart';
import 'member_profile_screen.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  QRViewController? _controller;
  final TextEditingController _manualEntryController = TextEditingController();
  bool _isFlashOn = false;
  bool _isFrontCamera = false;
  bool _isScanning = true;

  @override
  void initState() {
    super.initState();
    _requestCameraPermission();
  }

  @override
  void dispose() {
    _controller?.dispose();
    _manualEntryController.dispose();
    super.dispose();
  }

  Future<void> _requestCameraPermission() async {
    final attendanceProvider = Provider.of<AttendanceProvider>(context, listen: false);
    final hasPermission = await attendanceProvider.requestCameraPermission();
    
    if (!hasPermission && mounted) {
      AppHelpers.showErrorSnackBar(context, AppStrings.cameraPermissionDenied);
    }
  }

  void _onQRViewCreated(QRViewController controller) {
    setState(() {
      _controller = controller;
    });
    
    controller.scannedDataStream.listen((scanData) {
      if (_isScanning && scanData.code != null) {
        _handleQRScan(scanData.code!);
      }
    });
  }

  Future<void> _handleQRScan(String code) async {
    if (!_isScanning) return;
    
    setState(() {
      _isScanning = false;
    });

    final eventProvider = Provider.of<EventProvider>(context, listen: false);
    final attendanceProvider = Provider.of<AttendanceProvider>(context, listen: false);
    
    if (eventProvider.selectedEvent == null) {
      AppHelpers.showErrorSnackBar(context, 'No event selected');
      setState(() {
        _isScanning = true;
      });
      return;
    }

    final response = await attendanceProvider.scanMemberId(
      barcode: code,
      eventId: eventProvider.selectedEvent!.id,
    );

    if (response.isSuccess && response.data != null) {
      if (mounted) {
        _showMemberProfile(response.data!);
      }
    } else {
      if (mounted) {
        AppHelpers.showErrorSnackBar(context, response.errorMessage);
        setState(() {
          _isScanning = true;
        });
      }
    }
  }

  Future<void> _handleManualEntry() async {
    final code = _manualEntryController.text.trim();
    if (code.isEmpty) return;

    final validationError = Validators.validateMemberId(code);
    if (validationError != null) {
      AppHelpers.showErrorSnackBar(context, validationError);
      return;
    }

    await _handleQRScan(code);
    _manualEntryController.clear();
  }

  void _showMemberProfile(Member member) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => MemberProfileScreen(
          member: member,
          onAttendanceMarked: () {
            setState(() {
              _isScanning = true;
            });
          },
        ),
      ),
    );
  }

  Future<void> _toggleFlash() async {
    if (_controller != null) {
      await _controller!.toggleFlash();
      setState(() {
        _isFlashOn = !_isFlashOn;
      });
    }
  }

  Future<void> _toggleCamera() async {
    if (_controller != null) {
      await _controller!.flipCamera();
      setState(() {
        _isFrontCamera = !_isFrontCamera;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: CustomAppBar(
        title: AppStrings.scannerTitle,
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(_isFlashOn ? Icons.flash_on : Icons.flash_off),
            onPressed: _toggleFlash,
            tooltip: AppStrings.flashToggle,
          ),
          IconButton(
            icon: const Icon(Icons.switch_camera),
            onPressed: _toggleCamera,
            tooltip: AppStrings.cameraSwitch,
          ),
        ],
      ),
      body: Column(
        children: [
          _buildEventInfo(),
          Expanded(
            child: _buildScannerView(),
          ),
          _buildManualEntry(),
          _buildRecentScans(),
        ],
      ),
    );
  }

  Widget _buildEventInfo() {
    return Consumer<EventProvider>(
      builder: (context, eventProvider, child) {
        final event = eventProvider.selectedEvent;
        if (event == null) {
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppDimensions.paddingMedium),
            color: AppColors.error,
            child: const Text(
              'No event selected',
              style: TextStyle(color: Colors.white),
              textAlign: TextAlign.center,
            ),
          );
        }

        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppDimensions.paddingMedium),
          color: AppColors.primaryBlue,
          child: Column(
            children: [
              Text(
                event.title,
                style: const TextStyle(
                  color: AppColors.surfaceContainer,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              if (event.location != null) ...[
                const SizedBox(height: 4),
                Text(
                  event.location!,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
              if (event.time != null) ...[
                const SizedBox(height: 4),
                Text(
                  event.time!,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildScannerView() {
    return Stack(
      children: [
        QRView(
          key: qrKey,
          onQRViewCreated: _onQRViewCreated,
          overlay: QrScannerOverlayShape(
            borderColor: AppColors.primaryBlue,
            borderRadius: 10,
            borderLength: 30,
            borderWidth: 10,
            cutOutSize: 250,
          ),
        ),
        if (!_isScanning)
          Container(
            color: Colors.black54,
            child: const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
          ),
        Positioned(
          top: 20,
          left: 20,
          right: 20,
          child: Container(
            padding: const EdgeInsets.all(AppDimensions.paddingMedium),
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
            ),
            child: Text(
              AppStrings.scanInstruction,
              style: const TextStyle(
                color: AppColors.surfaceContainer,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildManualEntry() {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.paddingMedium),
      color: AppColors.surfaceContainer,
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _manualEntryController,
              decoration: InputDecoration(
                hintText: AppStrings.manualEntryHint,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: AppDimensions.paddingMedium,
                  vertical: AppDimensions.paddingSmall,
                ),
              ),
              onSubmitted: (_) => _handleManualEntry(),
            ),
          ),
          const SizedBox(width: AppDimensions.paddingSmall),
          ElevatedButton(
            onPressed: _handleManualEntry,
            child: const Text('Enter'),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentScans() {
    return Consumer<AttendanceProvider>(
      builder: (context, attendanceProvider, child) {
        final recentScans = attendanceProvider.recentScans;
        
        if (recentScans.isEmpty) {
          return const SizedBox.shrink();
        }

        return Container(
          height: 120,
          padding: const EdgeInsets.all(AppDimensions.paddingMedium),
          color: AppColors.surfaceContainer,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                AppStrings.recentScans,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppDimensions.paddingSmall),
              Expanded(
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: recentScans.length,
                  itemBuilder: (context, index) {
                    final member = recentScans[index];
                    return Padding(
                      padding: const EdgeInsets.only(right: AppDimensions.paddingSmall),
                      child: GestureDetector(
                        onTap: () => _showMemberProfile(member),
                        child: MemberCard(
                          member: member,
                          compact: true,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
