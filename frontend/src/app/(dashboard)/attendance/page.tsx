'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, PageHeader, DataTable, Button, FormField, SelectInput, TextInput } from '@/components/ui';
import { AttendanceService } from '@/services/attendance';
import type { Event, Attendance, AttendanceStats } from '@/interfaces';

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

// Simple Modal Component
const SimpleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
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
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // For now, we'll use a mock events list
      // In a real implementation, you'd fetch events from the API
      const mockEvents: EventWithAttendance[] = [
        {
          id: 1,
          title: 'Sunday Service',
          description: 'Weekly Sunday service',
          start_date: '2024-01-21T09:00:00Z',
          type: 'general',
          status: 'published',
          is_recurring: false,
          created_by: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          deleted: false,
          attendance_stats: {
            present: 120,
            absent: 30,
            first_timers: 15,
            total: 150
          }
        },
        {
          id: 2,
          title: 'Youth Group Meeting',
          description: 'Weekly youth group gathering',
          start_date: '2024-01-20T18:00:00Z',
          type: 'group',
          status: 'published',
          is_recurring: false,
          created_by: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          deleted: false,
          attendance_stats: {
            present: 25,
            absent: 5,
            first_timers: 3,
            total: 30
          }
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleGeneralAttendance = (event: Event) => {
    setSelectedEvent(event);
    // Reset form when opening modal
    setGeneralAttendanceForm({
      total_attendance: 0,
      first_timers_count: 0,
      notes: ''
    });
    setShowGeneralAttendanceModal(true);
  };

  const handleGeneralAttendanceSubmit = async () => {
    if (!selectedEvent) return;
    
    setSubmitting(true);
    try {
      // In a real implementation, you'd call the API here
      // await AttendanceService.updateGeneralAttendance(
      //   selectedEvent.id,
      //   generalAttendanceForm.total_attendance,
      //   generalAttendanceForm.first_timers_count,
      //   generalAttendanceForm.notes
      // );
      
      // For now, just update the local state
      const updatedEvents = events.map(event => {
        if (event.id === selectedEvent.id) {
          return {
            ...event,
            attendance_stats: {
              present: generalAttendanceForm.total_attendance,
              absent: 0, // This would be calculated from eligible members
              first_timers: generalAttendanceForm.first_timers_count,
              total: generalAttendanceForm.total_attendance + generalAttendanceForm.first_timers_count
            }
          };
        }
        return event;
      });
      
      setEvents(updatedEvents);
      setShowGeneralAttendanceModal(false);
      
      // Show success message (you can implement a toast notification here)
      alert('General attendance recorded successfully!');
    } catch (error) {
      console.error('Failed to record general attendance:', error);
      alert('Failed to record general attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (field: keyof GeneralAttendanceForm, value: string | number) => {
    setGeneralAttendanceForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
          >
            <i className="fas fa-users mr-1"></i>
            Individual
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleGeneralAttendance(event)}
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <i className="fas fa-calendar text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{events.length}</p>
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
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Events</h3>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                New Event
              </Button>
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
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage individual attendance records for this event.
              </p>
              {/* Individual attendance management will be implemented here */}
              <div className="text-center py-8">
                <i className="fas fa-users text-gray-400 text-4xl mx-auto mb-4"></i>
                <p className="text-gray-500 dark:text-gray-400">
                  Individual attendance management component will be implemented here.
                </p>
              </div>
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
                  />
                </FormField>

                <FormField label="Total First Timers">
                  <TextInput
                    type="number"
                    min="0"
                    value={generalAttendanceForm.first_timers_count.toString()}
                    onChange={(e) => handleFormChange('first_timers_count', parseInt(e.target.value) || 0)}
                    placeholder="Enter total first timers"
                  />
                </FormField>

                <FormField label="Notes (Optional)">
                  <TextInput
                    type="text"
                    value={generalAttendanceForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Add any additional notes"
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
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowGeneralAttendanceModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGeneralAttendanceSubmit}
                    disabled={submitting || (generalAttendanceForm.total_attendance === 0 && generalAttendanceForm.first_timers_count === 0)}
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