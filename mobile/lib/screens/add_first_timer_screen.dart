import 'package:flutter/material.dart';
import 'package:dropdown_search/dropdown_search.dart';
import '../models/first_timer.dart';
import '../models/event.dart';
import '../models/member.dart';
import '../services/database_service_orm.dart';
import '../orm/orm_database_service.dart';
import '../orm/entities/first_timer_entity.dart';
import '../services/first_timer_push_service.dart';
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
  final _databaseService = DatabaseService();
  final _ormDatabaseService = OrmDatabaseService();
  final _pushService = FirstTimerPushService();
  
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
  List<Member> _members = [];
  Member? _selectedMember;
  bool _isLoading = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadEvents();
    _loadMembers();
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
      
      print('Loaded ${events.length} events from database');
      
      // Filter for active events or today's events
      final today = DateTime.now();
      final activeEvents = events.where((event) {
        final eventDate = event.startDate;
        final isToday = eventDate.year == today.year &&
                       eventDate.month == today.month &&
                       eventDate.day == today.day;
        final isActive = event.isActive;
        print('Event: ${event.title}, Date: $eventDate, IsToday: $isToday, IsActive: $isActive');
        return isActive || isToday;
      }).toList();
      
      print('Filtered to ${activeEvents.length} active/today events');
      
      setState(() {
        _events = activeEvents;
        if (_events.isNotEmpty) {
          _selectedEvent = _events.first;
          print('Selected event: ${_selectedEvent!.title}');
        } else {
          print('No events available for selection');
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

  Future<void> _loadMembers() async {
    try {
      await _databaseService.initialize();
      final members = await _databaseService.getAllMembers();
      
      // Filter for active members only
      final activeMembers = members.where((member) => member.status.toLowerCase() == 'active').toList();
      
      setState(() {
        _members = activeMembers;
      });
    } catch (e) {
      print('Error loading members: $e');
      if (mounted) {
        AppHelpers.showErrorSnackBar(context, 'Failed to load members: $e');
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
      // Create FirstTimerEntity for local storage
      final firstTimerEntity = FirstTimerEntity(
        id: 0, // Will be set by database
        name: _nameController.text.trim(),
        location: _locationController.text.trim().isEmpty ? null : _locationController.text.trim(),
        primaryMobileNumber: _primaryPhoneController.text.trim(),
        secondaryMobileNumber: _secondaryPhoneController.text.trim().isEmpty ? null : _secondaryPhoneController.text.trim(),
        howWasService: _howWasServiceController.text.trim().isEmpty ? null : _howWasServiceController.text.trim(),
        isFirstTime: _isFirstTime,
        hasPermanentPlaceOfWorship: _hasPermanentPlaceOfWorship,
        invitedBy: _invitedByController.text.trim().isEmpty ? null : _invitedByController.text.trim(),
        invitedByMemberId: _selectedMember?.id,
        wouldLikeToStay: _wouldLikeToStay,
        eventId: _selectedEvent!.id,
        selfRegistered: false, // This is admin registration
        status: FirstTimerStatus.firstTimer,
        visitCount: 1,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      print('Creating first timer locally: ${firstTimerEntity.name}');
      
      // Save to local database first
      await _ormDatabaseService.initialize();
      final localId = await _ormDatabaseService.createFirstTimer(firstTimerEntity);
      
      print('First timer saved locally with ID: $localId');
      
      if (mounted) {
        AppHelpers.showSuccessSnackBar(context, 'First timer registered locally! Will sync when online.');
        
        // Try to push to server in background
        _pushService.pushUnpushedFirstTimers();
        
        Navigator.of(context).pop(true); // Return true to indicate success
      }
    } catch (e) {
      print('Error creating first timer: $e');
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
                    _buildMemberSelectionSection(),
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
            DropdownSearch<Event>(
              selectedItem: _selectedEvent,
              items: _events,
              itemAsString: (Event event) => '${event.title} - ${event.formattedDate} ${event.time ?? ''}'.trim(),
              dropdownDecoratorProps: DropDownDecoratorProps(
                dropdownSearchDecoration: InputDecoration(
                  border: const OutlineInputBorder(),
                  labelText: 'Select Event',
                  helperText: _events.isEmpty 
                      ? 'No events available. Create an event first or check if today\'s events exist.'
                      : 'Search and select the event for this first timer',
                ),
              ),
              popupProps: PopupProps.menu(
                showSearchBox: true,
                searchFieldProps: TextFieldProps(
                  decoration: const InputDecoration(
                    hintText: 'Search events...',
                    prefixIcon: Icon(Icons.search),
                  ),
                ),
                emptyBuilder: (context, searchEntry) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text('No events found'),
                    ),
                  );
                },
              ),
              onChanged: _events.isEmpty 
                  ? null 
                  : (Event? newValue) {
                      setState(() {
                        _selectedEvent = newValue;
                      });
                    },
              validator: (value) {
                if (value == null && _events.isNotEmpty) {
                  return 'Please select an event';
                }
                if (_events.isEmpty) {
                  return 'No events available. Please create an event first.';
                }
                return null;
              },
              enabled: _events.isNotEmpty,
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

  Widget _buildMemberSelectionSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Member Selection (Optional)',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppDimensions.paddingMedium),
            DropdownSearch<Member>(
              selectedItem: _selectedMember,
              items: _members,
              itemAsString: (Member member) => '${member.firstName} ${member.lastName}',
              dropdownDecoratorProps: DropDownDecoratorProps(
                dropdownSearchDecoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Select Member Who Invited',
                  hintText: 'Search and choose a member (optional)',
                ),
              ),
              popupProps: PopupProps.menu(
                showSearchBox: true,
                searchFieldProps: TextFieldProps(
                  decoration: const InputDecoration(
                    hintText: 'Search members...',
                    prefixIcon: Icon(Icons.search),
                  ),
                ),
                emptyBuilder: (context, searchEntry) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text('No members found'),
                    ),
                  );
                },
              ),
              onChanged: (Member? newValue) {
                setState(() {
                  _selectedMember = newValue;
                });
              },
              clearButtonProps: const ClearButtonProps(
                isVisible: true,
                icon: Icon(Icons.clear),
              ),
            ),
            const SizedBox(height: AppDimensions.paddingSmall),
            Text(
              'Select the member who invited this first timer (optional). This helps track who brought new visitors.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.onSurfaceVariant,
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
