import 'package:flutter/material.dart';
import '../services/domain_config_service.dart';
import '../widgets/domain_config_dialog.dart';
import '../utils/constants.dart';

class TappableVersionWidget extends StatefulWidget {
  final String version;
  final TextStyle? textStyle;
  final int tapCount;

  const TappableVersionWidget({
    super.key,
    required this.version,
    this.textStyle,
    this.tapCount = 5,
  });

  @override
  State<TappableVersionWidget> createState() => _TappableVersionWidgetState();
}

class _TappableVersionWidgetState extends State<TappableVersionWidget> {
  int _tapCount = 0;
  DateTime? _lastTapTime;

  void _onTap() {
    final now = DateTime.now();
    
    // Reset counter if more than 2 seconds have passed since last tap
    if (_lastTapTime != null && now.difference(_lastTapTime!).inSeconds > 2) {
      _tapCount = 0;
    }
    
    _tapCount++;
    _lastTapTime = now;
    
    if (_tapCount >= widget.tapCount) {
      _showDomainConfigDialog();
      _tapCount = 0; // Reset counter
    }
  }

  Future<void> _showDomainConfigDialog() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => const DomainConfigDialog(),
    );
    
    if (result == true && mounted) {
      // Domain was successfully updated
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Domain updated to: ${DomainConfigService.currentDomain}'),
          backgroundColor: AppColors.success,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _onTap,
      child: Text(
        widget.version,
        style: widget.textStyle,
      ),
    );
  }
}
