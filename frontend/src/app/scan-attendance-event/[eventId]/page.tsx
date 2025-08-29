'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, TextInput, Textarea } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';
import { AttendanceService } from '@/services/attendance';
import { EventsService } from '@/services/events';
import type { Event } from '@/interfaces';

interface ScanAttendancePageProps {
  params: {
    eventId: string;
  };
}

interface MemberInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_path?: string;
  member_identification_id: string;
  group?: string;
  family?: string;
  gender?: string;
}

const ScanAttendancePage: React.FC<ScanAttendancePageProps> = ({ params }) => {
  const { showToast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [scannerInput, setScannerInput] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check authentication first
    if (!isLoading && !isAuthenticated) {
      setError('You must be logged in to access this page');
      return;
    }

    if (isAuthenticated) {
      loadEvent();
    }
  }, [params.eventId, isAuthenticated, isLoading]);

  useEffect(() => {
    if (scanning && scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  }, [scanning]);

  const loadEvent = async () => {
    try {
      setError(null);
      const response = await EventsService.getEvent(parseInt(params.eventId));
      if (response.success && response.data) {
        setEvent(response.data);
      } else {
        setError('Event not found');
      }
    } catch (error: any) {
      console.error('Failed to load event:', error);
      if (error.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (error.response?.status === 404) {
        setError('Event not found');
      } else {
        setError('Failed to load event details. Please try again.');
      }
    }
  };

  const handleScannerInput = (value: string) => {
    setScannerInput(value);
    
    // Auto-submit when scanner input is complete (usually ends with Enter or is a complete ID)
    if (value.length >= 14) { // Member ID is 14 characters (yyyymmdd + 6 digits)
      handleScanMemberId(value);
    }
  };

  const handleManualInput = (value: string) => {
    setManualInput(value);
    
    // Auto-submit when Enter is pressed
    if (value.includes('\n')) {
      const memberId = value.replace('\n', '').trim();
      if (memberId) {
        handleScanMemberId(memberId);
        setManualInput('');
      }
    }
  };

  const handleScanMemberId = async (memberId: string) => {
    if (!event) {
      showToast('Event not loaded', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await AttendanceService.scanMemberId({
        member_identification_id: memberId,
        event_id: event.id,
        notes: notes.trim()
      });

      if (response.success) {
        // Update member info with the scanned member
        setMemberInfo({
          id: response.data.member.id,
          first_name: response.data.member.name.split(' ')[0] || '',
          last_name: response.data.member.name.split(' ').slice(1).join(' ') || '',
          email: response.data.member.email,
          member_identification_id: memberId,
          profile_image_path: undefined, // We don't have this in the response
          group: 'Unknown', // We don't have this in the response
          family: 'Unknown', // We don't have this in the response
          gender: 'Unknown' // We don't have this in the response
        });

        showToast(`Attendance marked successfully for ${response.data.member.name}`, 'success');
        
        // Reset scanner input for next scan
        setScannerInput('');
        
        // Auto-focus scanner for next scan
        setTimeout(() => {
          if (scannerInputRef.current) {
            scannerInputRef.current.focus();
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      if (error.response?.status === 401) {
        showToast('Authentication required. Please log in again.', 'error');
        setError('Authentication required. Please log in again.');
      } else {
        showToast(error.response?.data?.message || 'Error marking attendance', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScanMemberId(manualInput.trim());
      setManualInput('');
    }
  };

  const startScanning = () => {
    setScanning(true);
    setMemberInfo(null);
    setScannerInput('');
    setTimeout(() => {
      if (scannerInputRef.current) {
        scannerInputRef.current.focus();
      }
    }, 100);
  };

  const stopScanning = () => {
    setScanning(false);
    setScannerInput('');
  };

  const resetForm = () => {
    setMemberInfo(null);
    setScannerInput('');
    setManualInput('');
    setNotes('');
  };

  const handleLogout = () => {
    // Redirect to login page
    window.location.href = '/auth/login';
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-lock text-red-600 text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            You must be logged in to access the attendance scanner.
          </p>
          <Button onClick={handleLogout} variant="primary">
            <i className="fas fa-sign-in-alt mr-2"></i>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Show error state if there's an error loading the event
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-red-600 text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Event</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-3">
            <Button onClick={loadEvent} variant="primary">
              <i className="fas fa-redo mr-2"></i>
              Try Again
            </Button>
            <Button onClick={() => window.close()} variant="outline">
              <i className="fas fa-times mr-2"></i>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while loading event
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with User Info */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {event.title} - Attendance Scanner
            </h1>
            <p className="text-gray-600 mb-2">
              {event.start_date && new Date(event.start_date).toLocaleDateString()}
              {event.start_date && event.end_date && ' - '}
              {event.end_date && new Date(event.end_date).toLocaleDateString()}
            </p>
            {event.location && (
              <p className="text-gray-500">{event.location}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-medium">{user?.name || 'User'}</p>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              <i className="fas fa-sign-out-alt mr-1"></i>
              Logout
            </Button>
          </div>
        </div>

        {/* Event Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Event Details</h3>
              <p className="text-gray-600">
                Status: <span className="font-medium capitalize">{event.status}</span>
                {event.type && (
                  <> • Type: <span className="font-medium capitalize">{event.type}</span></>
                )}
              </p>
            </div>
            <Button
              onClick={startScanning}
              disabled={scanning}
              variant="primary"
            >
              <i className="fas fa-qrcode mr-2"></i>
              Start Scanning
            </Button>
            {scanning && (
              <Button onClick={stopScanning} variant="secondary">
                <i className="fas fa-stop mr-2"></i>
                Stop Scanning
              </Button>
            )}
          </div>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Member Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Member Information</h3>
            
            {memberInfo ? (
              <div className="space-y-4">
                {/* Member Photo */}
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                    {memberInfo.profile_image_path ? (
                      <img 
                        src={memberInfo.profile_image_path} 
                        alt={`${memberInfo.first_name} ${memberInfo.last_name}`}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <i className="fas fa-user text-gray-400 text-4xl"></i>
                    )}
                  </div>
                </div>

                {/* Member Details */}
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    {memberInfo.first_name} {memberInfo.last_name}
                  </h4>
                  <p className="text-gray-600 mb-4">{memberInfo.email}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Group:</span>
                      <p className="font-medium">{memberInfo.group}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Family:</span>
                      <p className="font-medium">{memberInfo.family}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Gender:</span>
                      <p className="font-medium capitalize">{memberInfo.gender}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Member ID:</span>
                      <p className="font-mono font-medium text-xs">{memberInfo.member_identification_id}</p>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <i className="fas fa-check-circle text-green-600 text-2xl mb-2"></i>
                  <p className="text-green-800 font-medium">Attendance Marked Successfully!</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user text-gray-400 text-4xl"></i>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-2">No Member Selected</h4>
                <p className="text-gray-600">
                  Scan a member ID card or enter a member ID to see member information
                </p>
              </div>
            )}
          </Card>

          {/* Right Column: Scanner Interface */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Scanner Interface</h3>
            
            {scanning ? (
              <div className="space-y-6">
                {/* Scanner Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                    <span className="text-blue-800">
                      Scanner is active. Scan a member ID card or manually enter the member ID.
                    </span>
                  </div>
                </div>

                {/* Active Scanner Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scanner Input (Active)
                  </label>
                  <input
                    ref={scannerInputRef}
                    type="text"
                    value={scannerInput}
                    onChange={(e) => handleScannerInput(e.target.value)}
                    placeholder="Scan member ID card..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg tracking-wider font-mono"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Scanner is active and listening for input
                  </p>
                </div>

                {/* Manual Input Alternative */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manual Entry
                  </label>
                  <Textarea
                    value={manualInput}
                    onChange={(e) => handleManualInput(e.target.value)}
                    placeholder="Type member ID manually and press Enter..."
                    rows={3}
                    className="font-mono tracking-wider"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Type the member ID and press Enter, or click the button below
                  </p>
                  <Button
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim() || loading}
                    className="mt-2"
                    variant="outline"
                  >
                    Get Member Details
                  </Button>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this attendance..."
                    rows={2}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Reset Form
                  </Button>
                  <Button
                    onClick={stopScanning}
                    variant="secondary"
                    className="flex-1"
                  >
                    Stop Scanning
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-qrcode text-gray-400 text-2xl"></i>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-2">Scanner Inactive</h4>
                <p className="text-gray-600 mb-4">
                  Click "Start Scanning" to begin marking attendance
                </p>
                <Button
                  onClick={startScanning}
                  variant="primary"
                >
                  <i className="fas fa-play mr-2"></i>
                  Start Scanning
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Instructions */}
        <Card className="p-6 mt-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5">1</span>
              <span>Click "Start Scanning" to activate the scanner</span>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5">2</span>
              <span>Scan member ID cards or manually enter member IDs</span>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5">3</span>
              <span>View member information and confirm attendance</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ScanAttendancePage; 