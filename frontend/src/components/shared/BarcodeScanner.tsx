'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, TextInput, Textarea, SelectInput, FormField } from '@/components/ui';
import { toast } from 'react-toastify';
import { AttendanceService } from '@/services/attendance';
import { EventsService } from '@/services/events';
import type { Event } from '@/interfaces';

interface BarcodeScannerProps {
  onAttendanceMarked?: (data: any) => void;
}

interface ScanResult {
  member: {
    id: number;
    name: string;
    email: string;
  };
  event: {
    id: number;
    name: string;
    date: string;
  };
  attendance: any;
  action: 'created' | 'updated';
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onAttendanceMarked }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Safe setter for scannedBarcode to ensure it's always a string
  const setScannedBarcodeSafe = (value: any) => {
    const stringValue = String(value || '');
    console.log('Setting scannedBarcode to:', stringValue, 'from:', value);
    setScannedBarcode(stringValue);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (isScanning && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isScanning]);

  // Debug effect to monitor scannedBarcode changes
  useEffect(() => {
    console.log('scannedBarcode changed:', scannedBarcode, 'type:', typeof scannedBarcode);
  }, [scannedBarcode]);

  const loadEvents = async () => {
    try {
      const response = await EventsService.getEvents();
      if (response.success && response.data.data) {
        const filteredEvents = response.data.data.filter((event: Event) => {
          if (!event.start_date) return false;
          const eventDate = new Date(event.start_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return eventDate >= today;
        });
        setEvents(filteredEvents);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const handleScan = async () => {
    // Debug logging
    console.log('handleScan called with scannedBarcode:', scannedBarcode, 'type:', typeof scannedBarcode);
    
    // Ensure scannedBarcode is always a string
    const barcode = String(scannedBarcode || '').trim();
    
    console.log('Processed barcode:', barcode);
    
    if (!barcode || !selectedEvent) {
      toast.error('Please enter a barcode and select an event');
      return;
    }

    setLoading(true);
    try {
      const response = await AttendanceService.scanBarcode({
        barcode: barcode,
        event_id: parseInt(selectedEvent),
        notes: notes.trim()
      });

      if (response.success) {
        setScanResult(response.data);
        toast.success(`Attendance marked successfully for ${response.data.member.name}`);
        
        // Reset form
        setScannedBarcodeSafe('');
        setNotes('');
        
        // Call callback if provided
        if (onAttendanceMarked) {
          onAttendanceMarked(response.data);
        }
        
        // Auto-focus for next scan
        setTimeout(() => {
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
        }, 1000);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to mark attendance';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = (value: string) => {
    setManualInput(value);
    // Auto-submit when Enter is pressed
    if (value.includes('\n')) {
      const barcode = value.replace('\n', '').trim();
      if (barcode) {
        setScannedBarcodeSafe(String(barcode));
        setManualInput('');
        handleScan();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    const barcode = String(scannedBarcode || '').trim();
    if (e.key === 'Enter' && barcode && selectedEvent) {
      handleScan();
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setScanResult(null);
    setScannedBarcodeSafe('');
    setTimeout(() => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }, 100);
  };

  const stopScanning = () => {
    setIsScanning(false);
    setScannedBarcodeSafe('');
    setScanResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Event Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Select Event</h3>
        <FormField label="Event">
          <SelectInput
            value={selectedEvent}
            onChange={setSelectedEvent}
            options={events.map(event => ({
              value: event.id.toString(),
              label: `${event.title} - ${event.start_date ? new Date(event.start_date).toLocaleDateString() : 'No date'}`
            }))}
            placeholder="Select an event for attendance"
          />
        </FormField>
      </Card>

      {/* Scanner Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Barcode Scanner</h3>
          <div className="space-x-2">
            {!isScanning ? (
              <Button onClick={startScanning} variant="primary">
                <i className="fas fa-qrcode mr-2"></i>
                Start Scanning
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="secondary">
                <i className="fas fa-stop mr-2"></i>
                Stop Scanning
              </Button>
            )}
          </div>
        </div>

        {isScanning && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 mr-2"></i>
                <span className="text-blue-800 dark:text-blue-200">
                  Scanner is active. Scan a member barcode or manually enter it below.
                </span>
              </div>
            </div>

            <FormField label="Barcode">
              <input
                ref={barcodeInputRef}
                type="text"
                value={scannedBarcode || ''}
                onChange={(e) => setScannedBarcodeSafe(e.target.value || '')}
                onKeyPress={handleKeyPress}
                placeholder="Scan or enter barcode..."
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 outline-none transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md focus:shadow-lg text-lg tracking-wider"
              />
            </FormField>

            <FormField label="Notes (Optional)">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this attendance..."
                rows={2}
              />
            </FormField>

            <Button
              onClick={handleScan}
              disabled={!String(scannedBarcode || '').trim() || !selectedEvent || loading}
              loading={loading}
              variant="primary"
              className="w-full"
            >
              {loading ? 'Processing...' : 'Mark Attendance'}
            </Button>
          </div>
        )}
      </Card>

      {/* Manual Input Alternative */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Manual Input</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-keyboard text-gray-600 dark:text-gray-400 mr-2"></i>
              <span className="text-gray-700 dark:text-gray-300">
                Type or paste barcode manually. Press Enter to submit.
              </span>
            </div>
          </div>

          <Textarea
            value={manualInput}
            onChange={(e) => handleManualInput(e.target.value)}
            placeholder="Type barcode here and press Enter..."
            rows={3}
            className="font-mono tracking-wider"
          />
        </div>
      </Card>

      {/* Scan Results */}
      {scanResult && (
        <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-green-600 dark:text-green-400"></i>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Attendance {scanResult.action === 'created' ? 'Marked' : 'Updated'} Successfully
              </h4>
              <div className="mt-2 space-y-1 text-green-700 dark:text-green-300">
                <p><strong>Member:</strong> {scanResult.member.name}</p>
                <p><strong>Event:</strong> {scanResult.event.name}</p>
                <p><strong>Date:</strong> {new Date(scanResult.event.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
                <p><strong>Action:</strong> {scanResult.action === 'created' ? 'New record created' : 'Existing record updated'}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-6 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4">How to Use</h3>
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <div className="flex items-start">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5">1</span>
            <span>Select an event from the dropdown above</span>
          </div>
          <div className="flex items-start">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5">2</span>
            <span>Click "Start Scanning" to activate the scanner</span>
          </div>
          <div className="flex items-start">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5">3</span>
            <span>Scan a member's barcode or manually enter it</span>
          </div>
          <div className="flex items-start">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5">4</span>
            <span>Add optional notes and click "Mark Attendance"</span>
          </div>
          <div className="flex items-start">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5">5</span>
            <span>The scanner will automatically focus for the next scan</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BarcodeScanner; 