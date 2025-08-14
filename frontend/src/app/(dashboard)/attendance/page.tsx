'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, PageHeader, DataTable, Button, FormField, SelectInput, TextInput } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared';
import { AttendanceService } from '@/services/attendance';
import { EventsService } from '@/services/events';
import type { Event, Attendance, AttendanceStats, Member, BulkAttendanceUpdate } from '@/interfaces';

interface EventWithAttendance extends Event {
  attendance_stats?: {
    present: number;
    absent: number;
    total: number;
  };
  general_attendance?: {
    total_attendance: number;
    first_timers_count: number;
  };
}

interface GeneralAttendanceForm {
  total_attendance: number;
  first_timers_count: number;
  notes: string;
}

interface IndividualAttendanceForm {
  member_id: number;
  status: 'present' | 'absent';
  notes: string;
}

// Enhanced Modal Component with better accessibility and animations
const SimpleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}>
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                aria-label="Close modal"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AttendancePage() {
  const [events, setEvents] = useState<EventWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showGeneralAttendanceModal, setShowGeneralAttendanceModal] = useState(false);
  const [generalAttendanceForm, setGeneralAttendanceForm] = useState<GeneralAttendanceForm>({
    total_attendance: 0,
    first_timers_count: 0,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingGeneralAttendance, setLoadingGeneralAttendance] = useState(false);
  
  // Individual attendance state
  const [eventAttendance, setEventAttendance] = useState<Attendance[]>([]);
  const [eligibleMembers, setEligibleMembers] = useState<Member[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [updatingAttendance, setUpdatingAttendance] = useState<number | null>(null);
  
  // Bulk selection state
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<'present' | 'absent'>('present');
  const [bulkNotes, setBulkNotes] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  
  // Enhanced state for better UX
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Memoized functions for better performance
  const loadEvents = useCallback(async () => {
    // Prevent multiple simultaneous calls and excessive API calls
    if (isRefreshing) {
      console.log('Already refreshing, skipping...');
      return;
    }

    try {
      setIsRefreshing(true);
      setLoading(true);
      setError(null);
      
      const response = await EventsService.getEvents({
        status: 'published',
        per_page: 50,
        for_attendance: true
      });

      if (response.success) {
        const eventsWithStats = response.data.data.map((event: Event) => ({
          ...event,
          attendance_stats: {
            present: 0,
            absent: 0,
            total: 0
          }
        }));
        
        // Set events first, then load attendance statistics
        setEvents(eventsWithStats);
        
        // Load attendance statistics without setting events again
        const eventsWithAttendanceStats = await Promise.all(
          eventsWithStats.map(async (event) => {
            try {
              const attendanceResponse = await AttendanceService.getEventAttendance(event.id);
              if (attendanceResponse.success) {
                const stats = attendanceResponse.data.statistics;
                return {
                  ...event,
                  attendance_stats: {
                    present: stats.individual_attendance.present,
                    absent: stats.individual_attendance.absent,
                    total: stats.individual_attendance.total_individual
                  },
                  general_attendance: stats.general_attendance
                };
              }
            } catch (error) {
              console.error(`Failed to load attendance for event ${event.id}:`, error);
            }
            return event;
          })
        );
        
        // Update events with attendance data
        setEvents(eventsWithAttendanceStats);
      } else {
        setError('Failed to load events');
        setEvents([]);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      setError('Failed to load events. Please check your connection and try again.');
      setEvents([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);



  const loadEventAttendance = useCallback(async (eventId: number) => {
    try {
      setLoadingAttendance(true);
      setError(null);
      
      const [attendanceResponse, eligibleResponse] = await Promise.all([
        AttendanceService.getEventAttendance(eventId),
        AttendanceService.getEligibleMembers(eventId)
      ]);

      if (attendanceResponse.success) {
        setEventAttendance(attendanceResponse.data.attendances || []);
      }

      if (eligibleResponse.success) {
        setEligibleMembers(eligibleResponse.data.eligible_members || []);
      }
    } catch (error) {
      console.error('Failed to load event attendance:', error);
      setError('Failed to load event attendance data. Please try again.');
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) {
      console.log('Already refreshing, please wait...');
      return;
    }
    // Reset refresh timestamp on manual refresh
    setLastRefresh(new Date());
    await loadEvents();
  }, [loadEvents, isRefreshing]);

  const handleEventSelect = useCallback(async (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
    setError(null);
    
    try {
      // First ensure all attendance records exist for this event
      await AttendanceService.ensureAttendanceRecords(event.id);
      // Then load the attendance data
      await loadEventAttendance(event.id);
    } catch (error) {
      console.error('Failed to ensure attendance records:', error);
      // Continue anyway, the updateAttendanceStatus will handle missing records
    }
  }, [loadEventAttendance]);

  const handleAttendanceStatusUpdate = useCallback(async (memberId: number, status: string, notes: string = '') => {
    if (!selectedEvent) return;

    // Validate status before sending
    if (!AttendanceService.isValidStatus(status)) {
      setError('Invalid attendance status');
      return;
    }

    try {
      setUpdatingAttendance(memberId);
      setError(null);
      
      const result = await AttendanceService.updateAttendanceStatus(
        selectedEvent.id,
        memberId,
        { status, notes }
      );

      if (result.success) {
        // Check if this member already has an attendance record in our local state
        const existingAttendance = eventAttendance.find(att => att.member_id === memberId);
        
        if (existingAttendance) {
          // Update existing attendance record
          setEventAttendance(prev => 
            prev.map(att => 
              att.member_id === memberId 
                ? { ...att, status: status as 'present' | 'absent', notes, updated_at: new Date().toISOString() }
                : att
            )
          );
        } else {
          // Add new attendance record to local state
          const newAttendance = {
            id: result.data.id,
            event_id: selectedEvent.id,
            member_id: memberId,
            status: status as 'present' | 'absent',
            notes: notes,
            check_in_time: undefined,
            check_out_time: undefined,
            recorded_by: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setEventAttendance(prev => [...prev, newAttendance]);
        }
        
        // Update the main events list to reflect changes
        setEvents(prev => 
          prev.map(event => {
            if (event.id === selectedEvent.id) {
              // Recalculate stats based on current eventAttendance state
              const currentAttendance = eventAttendance.map(att => 
                att.member_id === memberId 
                  ? { ...att, status: status as 'present' | 'absent', notes, updated_at: new Date().toISOString() }
                  : att
              );
              
              const newStats = AttendanceService.calculateAttendanceStats(currentAttendance);
              return { ...event, attendance_stats: newStats };
            }
            return event;
          })
        );
      } else {
        setError(`Failed to update attendance: ${result.message}`);
      }
    } catch (error) {
      console.error('Failed to update attendance status:', error);
      setError('Failed to update attendance status. Please try again.');
    } finally {
      setUpdatingAttendance(null);
    }
  }, [selectedEvent, eventAttendance]);

  const handleGeneralAttendance = useCallback(async (event: Event) => {
    setSelectedEvent(event);
    setError(null);
    setShowGeneralAttendanceModal(true);
    setLoadingGeneralAttendance(true);
    
    // Fetch existing general attendance data if it exists
    try {
      const response = await AttendanceService.getEventGeneralAttendance(event.id);
      if (response.success && response.data.general_attendance) {
        const existingData = response.data.general_attendance;
        setGeneralAttendanceForm({
          total_attendance: existingData.total_attendance || 0,
          first_timers_count: existingData.first_timers_count || 0,
          notes: existingData.notes || ''
        });
      } else {
        // Set default values if no existing data
        setGeneralAttendanceForm({
          total_attendance: 0,
          first_timers_count: 0,
          notes: ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch existing general attendance:', error);
      // Set default values on error
      setGeneralAttendanceForm({
        total_attendance: 0,
        first_timers_count: 0,
        notes: ''
      });
    } finally {
      setLoadingGeneralAttendance(false);
    }
  }, []);

  const handleGeneralAttendanceSubmit = useCallback(async () => {
    if (!selectedEvent) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const result = await AttendanceService.updateGeneralAttendance(
        selectedEvent.id,
        {
          total_attendance: generalAttendanceForm.total_attendance,
          first_timers_count: generalAttendanceForm.first_timers_count,
          notes: generalAttendanceForm.notes
        }
      );
      
      if (result.success) {
        // Update local state immediately
        const updatedEvents = events.map(event => {
          if (event.id === selectedEvent.id) {
            return {
              ...event,
              attendance_stats: {
                present: generalAttendanceForm.total_attendance,
                absent: 0,
                total: generalAttendanceForm.total_attendance
              }
            };
          }
          return event;
        });
        
        setEvents(updatedEvents);
        setShowGeneralAttendanceModal(false);
        
        // Show success message
        setError(null);
      } else {
        setError(`Failed to record general attendance: ${result.message}`);
      }
    } catch (error) {
      console.error('Failed to record general attendance:', error);
      setError('Failed to record general attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedEvent, generalAttendanceForm, events]);

  const handleFormChange = useCallback((field: keyof GeneralAttendanceForm, value: string | number) => {
    setGeneralAttendanceForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Bulk selection functions
  const handleSelectAll = useCallback(() => {
    if (selectedMembers.size === eligibleMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(eligibleMembers.map(member => member.id)));
    }
  }, [selectedMembers.size, eligibleMembers]);

  const handleMemberSelection = useCallback((memberId: number, selected: boolean) => {
    const newSelected = new Set(selectedMembers);
    if (selected) {
      newSelected.add(memberId);
    } else {
      newSelected.delete(memberId);
    }
    setSelectedMembers(newSelected);
  }, [selectedMembers]);

  const handleBulkUpdate = useCallback(async () => {
    if (!selectedEvent || selectedMembers.size === 0) return;

    setIsBulkUpdating(true);
    setError(null);

    try {
      const bulkUpdates: BulkAttendanceUpdate[] = Array.from(selectedMembers).map(memberId => ({
        member_id: memberId,
        status: bulkStatus,
        notes: bulkNotes
      }));

      const result = await AttendanceService.bulkUpdateAttendance(selectedEvent.id, bulkUpdates);

      if (result.success) {
        // Update local state
        setEventAttendance(prev => 
          prev.map(att => 
            selectedMembers.has(att.member_id) 
              ? { ...att, status: bulkStatus, notes: bulkNotes, updated_at: new Date().toISOString() }
              : att
          )
        );

        // Update events list
        setEvents(prev => 
          prev.map(event => {
            if (event.id === selectedEvent.id) {
              const updatedAttendance = eventAttendance.map(att => 
                selectedMembers.has(att.member_id) 
                  ? { ...att, status: bulkStatus, notes: bulkNotes, updated_at: new Date().toISOString() }
                  : att
              );
              const newStats = AttendanceService.calculateAttendanceStats(updatedAttendance);
              return { ...event, attendance_stats: newStats };
            }
            return event;
          })
        );

        // Clear selection and form
        setSelectedMembers(new Set());
        setBulkStatus('present');
        setBulkNotes('');
        
        setError(null);
      } else {
        setError(`Failed to update attendance: ${result.message}`);
      }
    } catch (error) {
      console.error('Failed to bulk update attendance:', error);
      setError('Failed to bulk update attendance. Please try again.');
    } finally {
      setIsBulkUpdating(false);
    }
  }, [selectedEvent, selectedMembers, bulkStatus, bulkNotes]);

  // Auto-refresh functionality - only refresh when needed
  useEffect(() => {
    // Clear any existing interval first
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }

    // Only set up auto-refresh if we have events, no modals are open, and initial load is complete
    if (hasInitialLoad && events.length > 0 && !showEventModal && !showGeneralAttendanceModal && !isRefreshing) {
      console.log('Setting up auto-refresh interval...');
      const interval = setInterval(() => {
        console.log('Auto-refresh triggered at:', new Date().toLocaleTimeString());
        if (!isRefreshing) {
          loadEvents();
        }
      }, 120000); // Refresh every 2 minutes
      
      setAutoRefreshInterval(interval);
    }
  }, [events.length, showEventModal, showGeneralAttendanceModal, isRefreshing, hasInitialLoad]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, []);

  // Initial load - only run once
  useEffect(() => {
    loadEvents();
    setHasInitialLoad(true);
  }, []); // Empty dependency array to run only once





  const columns = [
    {
      key: 'title',
      label: 'Event',
      render: (value: any, event: EventWithAttendance) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{event.title || 'Untitled Event'}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{event.description || 'No description'}</div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (value: any, event: EventWithAttendance) => (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <i className="fas fa-calendar mr-2"></i>
          {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'No date set'}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: any, event: EventWithAttendance) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          event.type === 'general' ? 'bg-blue-100 text-blue-800' :
          event.type === 'group' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
        </span>
      )
    },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (value: any, event: EventWithAttendance) => (
        <div className="text-sm">
          <div className="flex items-center justify-between">
            <span className="text-green-600 dark:text-green-400">
              {event.attendance_stats?.present || 0} members
            </span>
          </div>
                            <div className="text-gray-600 dark:text-gray-400 font-medium">
                    Individual: {event.attendance_stats?.total || 0}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    General: {(event.general_attendance?.total_attendance || 0) + (event.general_attendance?.first_timers_count || 0)}
                  </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, event: EventWithAttendance) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEventSelect(event)}
            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
          >
            <i className="fas fa-users mr-1"></i>
            Individual
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleGeneralAttendance(event)}
            className="hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
          >
            <i className="fas fa-chart-bar mr-1"></i>
            General
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Attendance Management"
          description="Track and manage attendance for all events"
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-triangle text-red-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <i className="fas fa-calendar text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{events.length}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-sm font-medium text-green-600">
                    {events.filter(e => e.status === 'published').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <i className="fas fa-users text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {events.reduce((sum, event) => sum + (event.attendance_stats?.present || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <i className="fas fa-star text-purple-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Present</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {events.reduce((sum, event) => sum + (event.attendance_stats?.present || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <i className="fas fa-chart-line text-orange-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Individual Attendance</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {events.reduce((sum, event) => sum + (event.attendance_stats?.total || 0), 0)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg/Event</p>
                  <p className="text-sm font-medium text-orange-600">
                    {events.length > 0 ? Math.round(events.reduce((sum, event) => sum + (event.attendance_stats?.total || 0), 0) / events.length) : 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <i className="fas fa-chart-bar text-indigo-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">General Attendance</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {events.reduce((sum, event) => sum + (event.general_attendance?.total_attendance || 0) + (event.general_attendance?.first_timers_count || 0), 0)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg/Event</p>
                  <p className="text-sm font-medium text-indigo-600">
                    {events.length > 0 ? Math.round(events.reduce((sum, event) => sum + (event.general_attendance?.total_attendance || 0) + (event.general_attendance?.first_timers_count || 0), 0) / events.length) : 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Events</h3>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                  {autoRefreshInterval && (
                    <span className="ml-2 text-green-600 dark:text-green-400">
                      <i className="fas fa-circle text-xs"></i> Auto-refresh active (2m)
                    </span>
                  )}
                  {isRefreshing && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                      <i className="fas fa-spinner animate-spin text-xs"></i> Loading...
                    </span>
                  )}

                </div>
                <Button 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isRefreshing ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2"></i>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sync-alt mr-2"></i>
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <DataTable
              data={events}
              columns={columns}
            />
          </div>
        </Card>

        {/* Event Attendance Modal */}
        {showEventModal && selectedEvent && (
          <SimpleModal
            isOpen={showEventModal}
            onClose={() => {
              setShowEventModal(false);
              setSelectedMembers(new Set());
              setBulkStatus('present');
              setBulkNotes('');
            }}
            title={`Individual Attendance - ${selectedEvent.title}`}
            size="4xl"
          >
            <div className="p-6">
              {/* Error Display in Modal */}
              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Event Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div>
                    <span className="font-medium">Date:</span> {selectedEvent.start_date ? new Date(selectedEvent.start_date).toLocaleDateString() : 'No date set'}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedEvent.type}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {selectedEvent.status}
                  </div>
                  <div>
                    <span className="font-medium">Eligible Members:</span> {eligibleMembers.length}
                  </div>
                </div>
                
                {/* Attendance Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Current Attendance</h5>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {eventAttendance.filter(a => a.status === 'present').length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Present</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {eventAttendance.filter(a => a.status === 'absent').length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Absent</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {eventAttendance.filter(a => a.status === 'present').length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Present</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk Selection Controls */}
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Bulk Update Attendance</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Select Members
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAll}
                      className="w-full"
                    >
                      {selectedMembers.size === eligibleMembers.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Status
                    </label>
                    <SelectInput
                      value={bulkStatus}
                      onChange={(value) => setBulkStatus(value as 'present' | 'absent')}
                      className="w-full"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </SelectInput>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Notes (Optional)
                    </label>
                    <TextInput
                      value={bulkNotes}
                      onChange={(e) => setBulkNotes(e.target.value)}
                      placeholder="Add notes for all selected members"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Button
                      onClick={handleBulkUpdate}
                      disabled={selectedMembers.size === 0 || isBulkUpdating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isBulkUpdating ? (
                        <>
                          <i className="fas fa-spinner animate-spin mr-2"></i>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>
                          Update {selectedMembers.size} Members
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {selectedMembers.size > 0 && (
                  <div className="mt-3 text-sm text-blue-700 dark:text-blue-300">
                    {selectedMembers.size} member(s) selected
                  </div>
                )}
              </div>

              {loadingAttendance ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Loading attendance data...</p>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Member Attendance
                  </h4>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={selectedMembers.size === eligibleMembers.length && eligibleMembers.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Member
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Notes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Last Updated
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {eligibleMembers.map((member) => {
                          const attendance = eventAttendance.find(a => a.member_id === member.id);
                          const currentStatus = attendance?.status || 'absent';
                          
                          return (
                            <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedMembers.has(member.id)}
                                  onChange={(e) => handleMemberSelection(member.id, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img
                                      className="h-10 w-10 rounded-full"
                                      src={member.profile_image_path || '/images/avatars/default-avatar.png'}
                                      alt=""
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {member.first_name} {member.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {member.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  AttendanceService.getStatusBadgeColor(currentStatus)
                                }`}>
                                  <i className={`${AttendanceService.getStatusIcon(currentStatus)} mr-1`}></i>
                                  {AttendanceService.getStatusDisplayName(currentStatus)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {attendance?.notes || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {attendance?.updated_at ? 
                                  AttendanceService.formatAttendanceTime(attendance.updated_at) : 
                                  'Never'
                                }
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <SelectInput
                                    value={currentStatus}
                                    onChange={(value) => handleAttendanceStatusUpdate(member.id, value)}
                                    disabled={updatingAttendance === member.id}
                                    className="w-32"
                                  >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                  </SelectInput>
                                  {updatingAttendance === member.id && (
                                    <div className="flex items-center">
                                      <LoadingSpinner size="sm" />
                                      <span className="ml-2 text-xs text-gray-500">Updating...</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </SimpleModal>
        )}

        {/* General Attendance Modal */}
        {showGeneralAttendanceModal && selectedEvent && (
          <SimpleModal
            isOpen={showGeneralAttendanceModal}
            onClose={() => setShowGeneralAttendanceModal(false)}
            title={`General Attendance - ${selectedEvent.title}`}
            size="2xl"
          >
            <div className="p-6">
              {/* Error Display in Modal */}
              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {loadingGeneralAttendance && (
                <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-center">
                    <i className="fas fa-spinner animate-spin mr-2 text-blue-600"></i>
                    <p className="text-sm text-blue-800 dark:text-blue-200">Loading existing attendance data...</p>
                  </div>
                </div>
              )}

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Record general attendance numbers for this event. Enter the total attendance of members and first timers.
              </p>
              
              <div className="space-y-6">
                <FormField label="Total Attendance of Members">
                  <TextInput
                    type="number"
                    min="0"
                    value={generalAttendanceForm.total_attendance.toString()}
                    onChange={(e) => handleFormChange('total_attendance', parseInt(e.target.value) || 0)}
                    placeholder="Enter total members present"
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    disabled={loadingGeneralAttendance}
                  />
                </FormField>

                <FormField label="Total First Timers">
                  <TextInput
                    type="number"
                    min="0"
                    value={generalAttendanceForm.first_timers_count.toString()}
                    onChange={(e) => handleFormChange('first_timers_count', parseInt(e.target.value) || 0)}
                    placeholder="Enter total first timers"
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    disabled={loadingGeneralAttendance}
                  />
                </FormField>

                <FormField label="Notes (Optional)">
                  <TextInput
                    type="text"
                    value={generalAttendanceForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Add any additional notes"
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    disabled={loadingGeneralAttendance}
                  />
                </FormField>

                {/* Summary Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Attendance Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Members Present:</p>
                      <p className="text-lg font-semibold text-green-600">{generalAttendanceForm.total_attendance}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">First Timers:</p>
                      <p className="text-lg font-semibold text-blue-600">{generalAttendanceForm.first_timers_count}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Attendance:</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {generalAttendanceForm.total_attendance + generalAttendanceForm.first_timers_count}
                    </p>
                    {selectedEvent && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Event: {selectedEvent.title}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowGeneralAttendanceModal(false)}
                    disabled={submitting}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGeneralAttendanceSubmit}
                    disabled={submitting || loadingGeneralAttendance || (generalAttendanceForm.total_attendance === 0 && generalAttendanceForm.first_timers_count === 0)}
                    className="hover:bg-blue-600 transition-colors duration-200"
                  >
                    {submitting ? (
                      <>
                        <i className="fas fa-spinner animate-spin mr-2"></i>
                        Recording...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        Record Attendance
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </SimpleModal>
        )}
      </div>
    </DashboardLayout>
  );
} 