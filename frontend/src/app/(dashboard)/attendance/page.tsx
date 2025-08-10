'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, PageHeader, DataTable, Button, FormField, SelectInput, TextInput } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared';
import { AttendanceService } from '@/services/attendance';
import { EventsService } from '@/services/events';
import type { Event, Attendance, AttendanceStats, Member } from '@/interfaces';

interface EventWithAttendance extends Event {
  attendance_stats?: {
    present: number;
    absent: number;
    first_timers: number;
    total: number;
  };
}

interface GeneralAttendanceForm {
  total_attendance: number;
  first_timers_count: number;
  notes: string;
}

interface IndividualAttendanceForm {
  member_id: number;
  status: 'present' | 'absent' | 'first_timer';
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
  
  // Individual attendance state
  const [eventAttendance, setEventAttendance] = useState<Attendance[]>([]);
  const [eligibleMembers, setEligibleMembers] = useState<Member[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [updatingAttendance, setUpdatingAttendance] = useState<number | null>(null);
  
  // Enhanced state for better UX
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastApiCall, setLastApiCall] = useState<Date>(new Date());
  const [apiCallCount, setApiCallCount] = useState(0);

  // Memoized functions for better performance
  const loadEvents = useCallback(async () => {
    // Prevent multiple simultaneous calls and excessive API calls
    if (isRefreshing) {
      console.log('Already refreshing, skipping...');
      return;
    }

    // Prevent API calls if we've made too many recently
    const now = new Date();
    const timeSinceLastCall = now.getTime() - lastApiCall.getTime();
    if (timeSinceLastCall < 5000 && apiCallCount > 10) { // 5 seconds, max 10 calls
      console.log('Too many API calls recently, skipping...');
      return;
    }

    try {
      setIsRefreshing(true);
      setLoading(true);
      setError(null);
      setLastApiCall(now);
      setApiCallCount(prev => prev + 1);
      
      const response = await EventsService.getEvents({
        status: 'published',
        per_page: 50
      });

      if (response.success) {
        const eventsWithStats = response.data.data.map((event: Event) => ({
          ...event,
          attendance_stats: {
            present: 0,
            absent: 0,
            first_timers: 0,
            total: 0
          }
        }));
        
        setEvents(eventsWithStats);
        await loadAttendanceStatistics(eventsWithStats);
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
  }, [isRefreshing, lastApiCall, apiCallCount]);

  const loadAttendanceStatistics = useCallback(async (eventsList: EventWithAttendance[]) => {
    try {
      const eventsWithStats = await Promise.all(
        eventsList.map(async (event) => {
          try {
            const attendanceResponse = await AttendanceService.getEventAttendance(event.id);
            if (attendanceResponse.success) {
              const stats = attendanceResponse.data.statistics;
              return {
                ...event,
                attendance_stats: {
                  present: stats.individual_attendance.present,
                  absent: stats.individual_attendance.absent,
                  first_timers: stats.individual_attendance.first_timers,
                  total: stats.individual_attendance.total_individual + (stats.general_attendance?.total_attendance || 0)
                }
              };
            }
          } catch (error) {
            console.error(`Failed to load attendance for event ${event.id}:`, error);
          }
          return event;
        })
      );
      
      setEvents(eventsWithStats);
    } catch (error) {
      console.error('Failed to load attendance statistics:', error);
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
    // Reset API call counter on manual refresh
    setApiCallCount(0);
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
                ? { ...att, status: status as 'present' | 'absent' | 'first_timer', notes, updated_at: new Date().toISOString() }
                : att
            )
          );
        } else {
          // Add new attendance record to local state
          const newAttendance = {
            id: result.data.id,
            event_id: selectedEvent.id,
            member_id: memberId,
            status: status as 'present' | 'absent' | 'first_timer',
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
                  ? { ...att, status: status as 'present' | 'absent' | 'first_timer', notes, updated_at: new Date().toISOString() }
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
  }, [selectedEvent, eventAttendance]); // Added eventAttendance back for the find operation

  const handleGeneralAttendance = useCallback((event: Event) => {
    setSelectedEvent(event);
    setGeneralAttendanceForm({
      total_attendance: 0,
      first_timers_count: 0,
      notes: ''
    });
    setError(null);
    setShowGeneralAttendanceModal(true);
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
                first_timers: generalAttendanceForm.first_timers_count,
                total: generalAttendanceForm.total_attendance + generalAttendanceForm.first_timers_count
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

  // Auto-refresh functionality - only refresh when needed
  useEffect(() => {
    // Completely disable auto-refresh if too many API calls
    if (apiCallCount > 25) {
      console.log('Too many API calls, disabling auto-refresh');
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        setAutoRefreshInterval(null);
      }
      return;
    }

    // Only set up auto-refresh if we have events and no modals are open
    if (events.length > 0 && !showEventModal && !showGeneralAttendanceModal && !isRefreshing) {
      console.log('Setting up auto-refresh interval...');
      const interval = setInterval(() => {
        console.log('Auto-refresh triggered at:', new Date().toLocaleTimeString());
        // Use a stable reference to prevent dependency issues
        if (!isRefreshing && apiCallCount < 20) { // Additional safety check
          loadEvents();
        } else {
          console.log('Skipping auto-refresh due to conditions');
        }
      }, 120000); // Refresh every 2 minutes instead of 1 minute
      
      setAutoRefreshInterval(interval);
      
      return () => {
        console.log('Clearing auto-refresh interval...');
        clearInterval(interval);
      };
    }
    
    return () => {
      if (autoRefreshInterval) {
        console.log('Cleaning up auto-refresh interval...');
        clearInterval(autoRefreshInterval);
        setAutoRefreshInterval(null);
      }
    };
  }, [events.length, showEventModal, showGeneralAttendanceModal, isRefreshing, apiCallCount, autoRefreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshInterval]);

  // Initial load - only run once
  useEffect(() => {
    loadEvents();
  }, []); // Empty dependency array to run only once

  // Reset API call counter every 5 minutes
  useEffect(() => {
    const resetInterval = setInterval(() => {
      setApiCallCount(0);
      console.log('API call counter reset');
    }, 300000); // 5 minutes
    
    return () => clearInterval(resetInterval);
  }, []);

  // Calculate total accumulated attendance
  const totalAccumulatedAttendance = events.reduce((sum, event) => {
    return sum + (event.attendance_stats?.total || 0);
  }, 0);

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
            <span className="text-blue-600 dark:text-blue-400">
              {event.attendance_stats?.first_timers || 0} first-timers
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">
            Total: {event.attendance_stats?.total || 0}
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">First Timers</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {events.reduce((sum, event) => sum + (event.attendance_stats?.first_timers || 0), 0)}
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
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Attendance</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {totalAccumulatedAttendance}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg/Event</p>
                  <p className="text-sm font-medium text-orange-600">
                    {events.length > 0 ? Math.round(totalAccumulatedAttendance / events.length) : 0}
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
                  <span className="ml-2 text-gray-400">
                    API calls: {apiCallCount}
                  </span>
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
            onClose={() => setShowEventModal(false)}
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
                        {eventAttendance.filter(a => a.status === 'first_timer').length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">First Timers</div>
                    </div>
                  </div>
                </div>
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
                                    <option value="first_timer">First Timer</option>
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
                  />
                </FormField>

                <FormField label="Notes (Optional)">
                  <TextInput
                    type="text"
                    value={generalAttendanceForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Add any additional notes"
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
                    disabled={submitting || (generalAttendanceForm.total_attendance === 0 && generalAttendanceForm.first_timers_count === 0)}
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