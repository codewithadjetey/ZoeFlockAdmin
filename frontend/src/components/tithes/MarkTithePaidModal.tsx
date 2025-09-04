"use client";

import React, { useState, useEffect } from 'react';
import { Button, TextInput, Textarea } from '@/components/ui';
import Modal from '@/components/shared/Modal';
import { toast } from 'react-toastify';
import { titheService } from '@/services/tithes';
import { Tithe, MarkTithePaidRequest } from '@/interfaces';

interface MarkTithePaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tithe: Tithe | null;
}

export const MarkTithePaidModal: React.FC<MarkTithePaidModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tithe,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MarkTithePaidRequest>({
    paid_amount: undefined,
    notes: '',
  });

  useEffect(() => {
    if (isOpen && tithe) {
      setFormData({
        paid_amount: tithe.remaining_amount || tithe.amount,
        notes: '',
      });
    }
  }, [isOpen, tithe]);

  const handleInputChange = (field: keyof MarkTithePaidRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tithe) return;

    setLoading(true);
    try {
      await titheService.markTitheAsPaid(tithe.id, formData);
      toast.success('Tithe marked as paid successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error marking tithe as paid:', error);
      toast.error(error.response?.data?.message || 'Error marking tithe as paid');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!tithe) return null;

  // Ensure amount is a number and handle type safety
  const titheAmount = typeof tithe.amount === 'number' ? tithe.amount : parseFloat(tithe.amount) || 0;
  const remainingAmount = typeof tithe.remaining_amount === 'number' ? tithe.remaining_amount : parseFloat(tithe.remaining_amount) || titheAmount;
  const paidAmount = typeof tithe.paid_amount === 'number' ? tithe.paid_amount : parseFloat(tithe.paid_amount) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Mark Tithe as Paid"
      size="md"
    >
      <div className="space-y-4">
        {/* Tithe Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Tithe Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Member:</span>
              <p className="font-medium">
                {tithe.member ? `${tithe.member.first_name} ${tithe.member.last_name}` : 'Unknown Member'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Total Amount:</span>
              <p className="font-medium">${titheAmount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-600">Already Paid:</span>
              <p className="font-medium text-green-600">${paidAmount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-600">Remaining:</span>
              <p className="font-medium text-red-600">${remainingAmount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-600">Frequency:</span>
              <p className="font-medium capitalize">{tithe.frequency}</p>
            </div>
            <div>
              <span className="text-gray-600">Due Date:</span>
              <p className="font-medium">{new Date(tithe.next_due_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paid Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Pay
            </label>
            <TextInput
              type="number"
              value={formData.paid_amount?.toString() || ''}
              onChange={(e) => handleInputChange('paid_amount', parseFloat(e.target.value) || 0)}
              placeholder={`Default: $${remainingAmount.toFixed(2)}`}
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the amount being paid now. This will be added to any existing payments.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Notes
            </label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Optional notes about this payment"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
            >
              Mark as Paid
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}; 