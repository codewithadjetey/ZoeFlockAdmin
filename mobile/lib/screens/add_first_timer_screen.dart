import 'package:flutter/material.dart';
import '../models/first_timer.dart';
import '../models/event.dart';
import '../services/api_service.dart';
import '../services/database_service_orm.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';
import '../widgets/custom_app_bar.dart';

class AddFirstTimerScreen extends StatefulWidget {
  const AddFirstTimerScreen({super.key});

  @override
  State<AddFirstTimerScreen> createState() => _AddFirstTimerScreenState();
}

class _AddFirstTimerScreenState extends State<AddFirstTimerScreen> {
  final _formKey = GlobalKey<FormState>();
  final _apiService = ApiService();
  final _databaseService = DatabaseService();
  
  // Form controllers
  final _nameController = TextEditingController();
  final _locationController = TextEditingController();
  final _primaryPhoneController = TextEditingController();
  final _secondaryPhoneController = TextEditingController();
  final _howWasServiceController = TextEditingController();
  final _invitedByController = TextEditingController();
  
  // Form state
  bool _isFirstTime = true;
  bool? _hasPermanentPlaceOfWorship;
  bool? _wouldLikeToStay;
  Event? _selectedEvent;
  List<Event> _events = [];
  bool _isLoading = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _locationController.dispose();
    _primaryPhoneController.dispose();
    _secondaryPhoneController.dispose();
    _howWasServiceController.dispose();
    _invitedByController.dispose();
    super.dispose();
  }

  Future<void> _loadEvents() async {
    setState(() {
      _isLoading = true;
    });

    try {
      await _databaseService.initialize();
      final events = await _databaseService.getAllEvents();
      
      // Filter for active events or today's events
      final today = DateTime.now();
      final activeEvents = events.where((event) {
        final eventDate = event.startDate;
        final isToday = eventDate.year == today.year &&
                       eventDate.month == today.month &&
                       eventDate.day == today.day;
        return event.isActive || isToday;
      }).toList();
      
      setState(() {
        _events = activeEvents;
        if (_events.isNotEmpty) {
          _selectedEvent = _events.first;
        }
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading events: $e');
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        AppHelpers.showErrorSnackBar(context, 'Failed to load events: $e');
      }
    }
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedEvent == null) {
      AppHelpers.showErrorSnackBar(context, 'Please select an event');
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final firstTimerData = {
        'name': _nameController.text.trim(),
        'location': _locationController.text.trim().isEmpty ? null : _locationController.text.trim(),
        'primary_mobile_number': _primaryPhoneController.text.trim(),
        'secondary_mobile_number': _secondaryPhoneController.text.trim().isEmpty ? null : _secondaryPhoneController.text.trim(),
        'how_was_service': _howWasServiceController.text.trim().isEmpty ? null : _howWasServiceController.text.trim(),
        'is_first_time': _isFirstTime,
        'has_permanent_place_of_worship': _hasPermanentPlaceOfWorship,
        'invited_by': _invitedByController.text.trim().isEmpty ? null : _invitedByController.text.trim(),
        'would_like_to_stay': _wouldLikeToStay,
        'event_id': _selectedEvent!.id,
        'self_registered': false, // This is admin registration
      };

      print('Submitting first timer data: $firstTimerData');
      
      final response = await _apiService.createFirstTimer(firstTimerData);
      
      if (response.isSuccess && response.data != null) {
        if (mounted) {
          AppHelpers.showSuccessSnackBar(context, 'First timer registered successfully!');
          Navigator.of(context).pop(true); // Return true to indicate success
        }
      } else {
        if (mounted) {
          AppHelpers.showErrorSnackBar(context, 'Failed to register first timer: ${response.message}');
        }
      }
    } catch (e) {
      print('Error submitting first timer: $e');
      if (mounted) {
        AppHelpers.showErrorSnackBar(context, 'Failed to register first timer: $e');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  String _getBooleanText(bool? value) {
    if (value == true) {
      return 'Yes';
    } else if (value == false) {
      return 'No';
    } else {
      return 'Not specified';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: 'Add First Timer',
        actions: [
          TextButton(
            onPressed: _isSubmitting ? null : _submitForm,
            child: _isSubmitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Save'),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(AppDimensions.paddingMedium),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildEventSelector(),
                    const SizedBox(height: AppDimensions.paddingLarge),
                    _buildPersonalInfoSection(),
                    const SizedBox(height: AppDimensions.paddingLarge),
                    _buildContactInfoSection(),
                    const SizedBox(height: AppDimensions.paddingLarge),
                    _buildServiceFeedbackSection(),
                    const SizedBox(height: AppDimensions.paddingLarge),
                    _buildAdditionalInfoSection(),
                    const SizedBox(height: AppDimensions.paddingXLarge),
                    _buildSubmitButton(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildEventSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Event',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingSmall),
            DropdownButtonFormField<Event>(
              value: _selectedEvent,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Select Event',
              ),
              items: _events.map((event) {
                return DropdownMenuItem(
                  value: event,
                  child: Text(event.title),
                );
              }).toList(),
              onChanged: (Event? newValue) {
                setState(() {
                  _selectedEvent = newValue;
                });
              },
              validator: (value) {
                if (value == null) {
                  return 'Please select an event';
                }
                return null;
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPersonalInfoSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Personal Information',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Full Name *',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter the full name';
                }
                return null;
              },
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            TextFormField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: 'Location',
                border: OutlineInputBorder(),
                hintText: 'City, State/Province',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactInfoSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Contact Information',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            TextFormField(
              controller: _primaryPhoneController,
              decoration: const InputDecoration(
                labelText: 'Primary Phone Number *',
                border: OutlineInputBorder(),
                hintText: '+1234567890',
              ),
              keyboardType: TextInputType.phone,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter the primary phone number';
                }
                return null;
              },
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            TextFormField(
              controller: _secondaryPhoneController,
              decoration: const InputDecoration(
                labelText: 'Secondary Phone Number',
                border: OutlineInputBorder(),
                hintText: '+1234567890',
              ),
              keyboardType: TextInputType.phone,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceFeedbackSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Service Feedback',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            TextFormField(
              controller: _howWasServiceController,
              decoration: const InputDecoration(
                labelText: 'How was the service?',
                border: OutlineInputBorder(),
                hintText: 'Share your experience...',
              ),
              maxLines: 3,
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            TextFormField(
              controller: _invitedByController,
              decoration: const InputDecoration(
                labelText: 'Who invited you?',
                border: OutlineInputBorder(),
                hintText: 'Member name or relationship',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdditionalInfoSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Additional Information',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            SwitchListTile(
              title: const Text('Is this your first time visiting?'),
              subtitle: const Text('Toggle if this is not their first visit'),
              value: _isFirstTime,
              onChanged: (bool value) {
                setState(() {
                  _isFirstTime = value;
                });
              },
            ),
            ListTile(
              title: const Text('Do you have a permanent place of worship?'),
              subtitle: Text(_getBooleanText(_hasPermanentPlaceOfWorship)),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: Icon(
                      _hasPermanentPlaceOfWorship == true ? Icons.check_circle : Icons.radio_button_unchecked,
                      color: _hasPermanentPlaceOfWorship == true ? AppColors.success : null,
                    ),
                    onPressed: () {
                      setState(() {
                        _hasPermanentPlaceOfWorship = _hasPermanentPlaceOfWorship == true ? null : true;
                      });
                    },
                  ),
                  IconButton(
                    icon: Icon(
                      _hasPermanentPlaceOfWorship == false ? Icons.cancel : Icons.radio_button_unchecked,
                      color: _hasPermanentPlaceOfWorship == false ? AppColors.error : null,
                    ),
                    onPressed: () {
                      setState(() {
                        _hasPermanentPlaceOfWorship = _hasPermanentPlaceOfWorship == false ? null : false;
                      });
                    },
                  ),
                ],
              ),
            ),
            ListTile(
              title: const Text('Would you like to stay?'),
              subtitle: Text(_getBooleanText(_wouldLikeToStay)),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: Icon(
                      _wouldLikeToStay == true ? Icons.check_circle : Icons.radio_button_unchecked,
                      color: _wouldLikeToStay == true ? AppColors.success : null,
                    ),
                    onPressed: () {
                      setState(() {
                        _wouldLikeToStay = _wouldLikeToStay == true ? null : true;
                      });
                    },
                  ),
                  IconButton(
                    icon: Icon(
                      _wouldLikeToStay == false ? Icons.cancel : Icons.radio_button_unchecked,
                      color: _wouldLikeToStay == false ? AppColors.error : null,
                    ),
                    onPressed: () {
                      setState(() {
                        _wouldLikeToStay = _wouldLikeToStay == false ? null : false;
                      });
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isSubmitting ? null : _submitForm,
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: AppDimensions.paddingMedium),
        ),
        child: _isSubmitting
            ? const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  SizedBox(width: AppDimensions.paddingSmall),
                  Text('Registering...'),
                ],
              )
            : const Text('Register First Timer'),
      ),
    );
  }
}
