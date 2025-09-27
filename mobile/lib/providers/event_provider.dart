import 'package:flutter/material.dart';
import '../models/event.dart';
import '../models/api_response.dart';
import '../services/api_service.dart';
import '../services/database_service.dart';
import '../services/auth_service.dart';

class EventProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final DatabaseService _databaseService = DatabaseService();
  final AuthService _authService = AuthService();
  
  bool _isLoading = false;
  List<Event> _events = [];
  Event? _selectedEvent;
  String? _errorMessage;
  bool _isOffline = false;

  bool get isLoading => _isLoading;
  List<Event> get events => List.unmodifiable(_events);
  Event? get selectedEvent => _selectedEvent;
  String? get errorMessage => _errorMessage;
  bool get isOffline => _isOffline;

  List<Event> get activeEvents => _events.where((event) => event.isActive).toList();
  List<Event> get upcomingEvents => _events.where((event) => event.isUpcoming).toList();
  List<Event> get todayEvents => _events.where((event) => event.isToday).toList();
  List<Event> get eligibleEvents => _events.where((event) => event.isEligibleForAttendance).toList();

  Future<void> initialize() async {
    await _loadEventsFromDatabase();
  }

  Future<void> refreshEvents({bool eligibleForAttendance = true}) async {
    _setLoading(true);
    _clearError();
    
    try {
      // Load from database first (offline data is primary)
      await _loadEventsFromDatabase();
      _isOffline = true;
      
      // Try to sync with API in background (optional)
      _syncWithAPI(eligibleForAttendance);
      
    } catch (e) {
      _events = [];
      _setError('Failed to load events from database: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  /// Sync with API in background (optional)
  Future<void> _syncWithAPI(bool eligibleForAttendance) async {
    try {
      final response = await _apiService.getEvents(eligibleForAttendance: eligibleForAttendance);
      
      if (response.isSuccess && response.data != null) {
        // Update local database with fresh data
        await _databaseService.insertEvents(response.data!);
        // Reload from database to get updated data
        await _loadEventsFromDatabase();
        _isOffline = false;
        _clearError();
        print('EventProvider: Events synced with API successfully');
      }
    } catch (e) {
      // Keep using offline data, API sync failed
      print('EventProvider: API sync failed, continuing with offline data: $e');
    }
  }

  /// Manual sync with API (for sync dialog)
  Future<bool> syncWithAPI({bool eligibleForAttendance = true}) async {
    try {
      _setLoading(true);
      final response = await _apiService.getEvents(eligibleForAttendance: eligibleForAttendance);
      
      if (response.isSuccess && response.data != null) {
        // Update local database with fresh data
        await _databaseService.insertEvents(response.data!);
        // Reload from database to get updated data
        await _loadEventsFromDatabase();
        _isOffline = false;
        _clearError();
        notifyListeners();
        return true;
      } else {
        _setError('Sync failed: ${response.errorMessage}');
        return false;
      }
    } catch (e) {
      _setError('Sync failed: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refreshAllEvents() async {
    await refreshEvents(eligibleForAttendance: false);
  }

  Future<void> _loadEventsFromDatabase() async {
    try {
      _events = await _databaseService.getAllEvents();
      await _restoreSelectedEvent();
    } catch (e) {
      _events = [];
      _setError('Failed to load events from database');
    }
  }

  Future<void> _restoreSelectedEvent() async {
    try {
      final lastEventId = await _authService.getLastEventId();
      if (lastEventId != null && _events.isNotEmpty) {
        try {
          final event = _events.firstWhere((e) => e.id == lastEventId);
          _selectedEvent = event;
        } catch (e) {
          // Event not found, use first available
          _selectedEvent = _events.first;
        }
      } else if (_events.isNotEmpty) {
        _selectedEvent = _events.first;
      }
    } catch (e) {
      // Error restoring selected event, use first available
      if (_events.isNotEmpty) {
        _selectedEvent = _events.first;
      }
    }
  }

  Future<void> selectEvent(Event event) async {
    _selectedEvent = event;
    await _authService.setLastEventId(event.id);
    notifyListeners();
  }

  Future<void> selectEventById(int eventId) async {
    try {
      final event = _events.firstWhere((e) => e.id == eventId);
      await selectEvent(event);
    } catch (e) {
      _setError('Event not found');
    }
  }

  Future<Event?> getEventById(int eventId) async {
    try {
      // First try to find in current events
      final event = _events.firstWhere((e) => e.id == eventId);
      return event;
    } catch (e) {
      // If not found, try to fetch from API
      if (!_isOffline) {
        final response = await _apiService.getEvent(eventId);
        if (response.isSuccess && response.data != null) {
          final event = response.data!;
          // Add to current events if not already present
          if (!_events.any((e) => e.id == event.id)) {
            _events.add(event);
            await _databaseService.insertEvent(event);
            notifyListeners();
          }
          return event;
        }
      }
      return null;
    }
  }

  Future<void> updateEventAttendanceCount(int eventId, int count) async {
    try {
      final eventIndex = _events.indexWhere((e) => e.id == eventId);
      if (eventIndex != -1) {
        _events[eventIndex] = _events[eventIndex].copyWith(attendanceCount: count);
        
        // Update in database
        await _databaseService.updateEvent(_events[eventIndex]);
        
        // Update selected event if it's the same
        if (_selectedEvent?.id == eventId) {
          _selectedEvent = _events[eventIndex];
        }
        
        notifyListeners();
      }
    } catch (e) {
      _setError('Failed to update attendance count');
    }
  }

  Future<void> addEvent(Event event) async {
    try {
      _events.add(event);
      await _databaseService.insertEvent(event);
      notifyListeners();
    } catch (e) {
      _setError('Failed to add event');
    }
  }

  Future<void> updateEvent(Event event) async {
    try {
      final index = _events.indexWhere((e) => e.id == event.id);
      if (index != -1) {
        _events[index] = event;
        await _databaseService.updateEvent(event);
        
        // Update selected event if it's the same
        if (_selectedEvent?.id == event.id) {
          _selectedEvent = event;
        }
        
        notifyListeners();
      }
    } catch (e) {
      _setError('Failed to update event');
    }
  }

  Future<void> deleteEvent(int eventId) async {
    try {
      _events.removeWhere((e) => e.id == eventId);
      await _databaseService.deleteEvent(eventId);
      
      // Clear selected event if it was deleted
      if (_selectedEvent?.id == eventId) {
        _selectedEvent = _events.isNotEmpty ? _events.first : null;
        if (_selectedEvent != null) {
          await _authService.setLastEventId(_selectedEvent!.id);
        } else {
          await _authService.clearLastEventId();
        }
      }
      
      notifyListeners();
    } catch (e) {
      _setError('Failed to delete event');
    }
  }

  Future<List<Event>> searchEvents(String query) async {
    if (query.isEmpty) return _events;
    
    return _events.where((event) {
      final title = event.title.toLowerCase();
      final description = event.description?.toLowerCase() ?? '';
      final location = event.location?.toLowerCase() ?? '';
      final searchQuery = query.toLowerCase();
      
      return title.contains(searchQuery) ||
             description.contains(searchQuery) ||
             location.contains(searchQuery);
    }).toList();
  }

  Future<void> clearEvents() async {
    _events.clear();
    _selectedEvent = null;
    await _authService.clearLastEventId();
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void clearError() {
    _clearError();
  }
}
