'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, TextInput, FormField } from '@/components/ui';
import { toast } from 'react-toastify';
import { AttendanceService } from '@/services/attendance';
import type { Member } from '@/services/members';

interface BarcodeGeneratorProps {
  member: Member;
  onBarcodeGenerated?: (barcode: string) => void;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ member, onBarcodeGenerated }) => {
  const [barcode, setBarcode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Check if member has barcode property (it might not exist in the interface)
    if ((member as any).barcode) {
      setBarcode((member as any).barcode);
    }
  }, [(member as any).barcode]);

  const getMemberBarcode = async () => {
    setLoading(true);
    try {
      // Use the member identification ID as barcode for now
      const response = await AttendanceService.getMemberIdentificationId(member.id);
      if (response.success) {
        setBarcode(response.data.member_identification_id);
        toast.success('Member ID retrieved successfully');
        if (onBarcodeGenerated) {
          onBarcodeGenerated(response.data.member_identification_id);
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to retrieve member ID';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const generateNewBarcode = async () => {
    setGenerating(true);
    try {
      // Generate a new member identification ID
      const response = await AttendanceService.generateMemberIdentificationId(member.id);
      if (response.success) {
        setBarcode(response.data.member_identification_id);
        toast.success('New member ID generated successfully');
        if (onBarcodeGenerated) {
          onBarcodeGenerated(response.data.member_identification_id);
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to generate member ID';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const copyBarcode = () => {
    if (barcode) {
      navigator.clipboard.writeText(barcode);
      toast.success('Barcode copied to clipboard');
    }
  };

  const downloadBarcode = () => {
    if (!barcode) return;

    // Create a simple text file with the barcode
    const blob = new Blob([barcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${member.first_name}_${member.last_name}_barcode.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Barcode downloaded successfully');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Member Barcode</h3>
        <div className="flex space-x-2">
          {!barcode ? (
            <Button
              onClick={getMemberBarcode}
              loading={loading}
              variant="primary"
              size="sm"
            >
              <i className="fas fa-qrcode mr-2"></i>
              Get Barcode
            </Button>
          ) : (
            <Button
              onClick={generateNewBarcode}
              loading={generating}
              variant="secondary"
              size="sm"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Generate New
            </Button>
          )}
        </div>
      </div>

      {barcode ? (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Barcode
                </label>
                <div className="font-mono text-lg tracking-wider bg-white dark:bg-gray-900 px-3 py-2 rounded border">
                  {barcode}
                </div>
              </div>
              <div className="ml-4 flex space-x-2">
                <Button
                  onClick={copyBarcode}
                  variant="outline"
                  size="sm"
                >
                  <i className="fas fa-copy"></i>
                </Button>
                <Button
                  onClick={downloadBarcode}
                  variant="outline"
                  size="sm"
                >
                  <i className="fas fa-download"></i>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 mr-2 mt-1"></i>
              <div className="text-blue-800 dark:text-blue-200 text-sm">
                <p className="font-medium mb-1">How to use this barcode:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Print this barcode on the member's ID card or attendance card</li>
                  <li>Use the attendance scanner to scan this barcode during events</li>
                  <li>The barcode will automatically mark the member as present</li>
                  <li>Keep this barcode secure and unique to each member</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <i className="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400 mr-2 mt-1"></i>
              <div className="text-yellow-800 dark:text-yellow-200 text-sm">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>This barcode is unique to {member.first_name} {member.last_name}</li>
                  <li>Do not share or duplicate this barcode</li>
                  <li>If compromised, generate a new barcode immediately</li>
                  <li>The barcode format is: ZF + Member ID + Random digits</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <i className="fas fa-qrcode text-4xl mb-4"></i>
          <p>No barcode generated yet.</p>
          <p className="text-sm">Click "Get Barcode" to generate a unique barcode for this member.</p>
        </div>
      )}
    </Card>
  );
};

export default BarcodeGenerator; 