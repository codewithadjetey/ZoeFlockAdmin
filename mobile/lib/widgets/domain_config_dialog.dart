import 'package:flutter/material.dart';
import '../services/domain_config_service.dart';
import '../utils/constants.dart';

class DomainConfigDialog extends StatefulWidget {
  const DomainConfigDialog({super.key});

  @override
  State<DomainConfigDialog> createState() => _DomainConfigDialogState();
}

class _DomainConfigDialogState extends State<DomainConfigDialog> {
  final TextEditingController _domainController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _domainController.text = DomainConfigService.currentDomain;
  }

  @override
  void dispose() {
    _domainController.dispose();
    super.dispose();
  }

  Future<void> _saveDomain() async {
    if (_domainController.text.trim().isEmpty) {
      _showError('Please enter a domain');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final success = await DomainConfigService.setDomain(_domainController.text.trim());
    
    setState(() {
      _isLoading = false;
    });

    if (success) {
      if (mounted) {
        Navigator.of(context).pop(true); // Return true to indicate success
      }
    } else {
      if (mounted) {
        _showError('Invalid domain format');
      }
    }
  }

  Future<void> _resetToDefault() async {
    setState(() {
      _isLoading = true;
    });

    final success = await DomainConfigService.resetToDefault();
    
    setState(() {
      _isLoading = false;
    });

    if (success) {
      _domainController.text = DomainConfigService.currentDomain;
      _showSuccess('Reset to default domain');
    } else {
      _showError('Failed to reset domain');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
      ),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.success,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Configure Backend Domain'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'Enter your backend domain (without http:// or https://)',
            style: TextStyle(fontSize: 14),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _domainController,
            decoration: const InputDecoration(
              labelText: 'Domain',
              hintText: 'example.com',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.domain),
            ),
            keyboardType: TextInputType.url,
            textInputAction: TextInputAction.done,
            onSubmitted: (_) => _saveDomain(),
          ),
          const SizedBox(height: 16),
          if (DomainConfigService.isUsingCustomDomain)
            TextButton.icon(
              onPressed: _isLoading ? null : _resetToDefault,
              icon: const Icon(Icons.refresh),
              label: const Text('Reset to Default'),
            ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _saveDomain,
          child: _isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Save'),
        ),
      ],
    );
  }
}
