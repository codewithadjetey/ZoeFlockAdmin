import React, { useState } from 'react';
import { Button, Modal, TextInput, SelectInput, Textarea, SimpleInput } from '@/components/ui';
import { Tithe, AddTithePaymentRequest, PAYMENT_METHODS } from '@/interfaces';
import { titheService } from '@/services/tithes';
import { useToast } from '@/hooks/useToast';

interface TithePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tithe: Tithe | null;
}

export const TithePaymentModal: React.FC<TithePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tithe,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddTithePaymentRequest>({
    amount: 0,
    payment_method: 'cash',
    reference_number: '',
    notes: '',
    payment_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tithe) return;

    if (formData.amount <= 0) {
      showToast('Payment amount must be greater than 0', 'error');
      return;
    }

    if (formData.amount > tithe.remaining_amount) {
      showToast(`Payment amount cannot exceed remaining amount of $${tithe.remaining_amount}`, 'error');
      return;
    }

    try {
      setLoading(true);
      await titheService.addPayment(tithe.id, formData);
      showToast('Payment added successfully', 'success');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error adding payment:', error);
      showToast(error.response?.data?.message || 'Error adding payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: 0,
      payment_method: 'cash',
      reference_number: '',
      notes: '',
      payment_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = () => {
    return formData.amount > 0 && formData.amount <= (tithe?.remaining_amount || 0);
  };

  if (!tithe) return null;

  // Convert PAYMENT_METHODS to SelectInput options format
  const paymentMethodOptions = Object.entries(PAYMENT_METHODS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Partial Payment"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tithe Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tithe Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Member:</span>
              <p className="font-medium">
                {tithe.member ? `${tithe.member.first_name} ${tithe.member.last_name}` : 'Unknown Member'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Total Amount:</span>
              <p className="font-medium">${tithe.amount}</p>
            </div>
            <div>
              <span className="text-gray-500">Paid Amount:</span>
              <p className="font-medium">${tithe.paid_amount}</p>
            </div>
            <div>
              <span className="text-gray-500">Remaining:</span>
              <p className="font-medium text-red-600">${tithe.remaining_amount}</p>
            </div>
          </div>
        </div>

        {/* Payment Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount *
          </label>
          <SimpleInput
            type="number"
            step="0.01"
            min="0.01"
            max={tithe.remaining_amount}
            value={formData.amount.toString()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = parseFloat(e.target.value) || 0;
              setFormData({ ...formData, amount: value });
            }}
            placeholder={`Enter amount (max: $${tithe.remaining_amount})`}
            className={formData.amount > tithe.remaining_amount ? 'border-red-500' : ''}
          />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">
              Minimum: $0.01
            </span>
            <span className={`font-medium ${
              formData.amount > tithe.remaining_amount ? 'text-red-600' : 'text-gray-500'
            }`}>
              Maximum: ${tithe.remaining_amount}
            </span>
          </div>
          {formData.amount > tithe.remaining_amount && (
            <p className="text-xs text-red-600 mt-1">
              Payment amount cannot exceed remaining balance
            </p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <SelectInput
            value={formData.payment_method}
            onChange={(value: string) => setFormData({ ...formData, payment_method: value as any })}
            options={paymentMethodOptions}
            placeholder="Select payment method"
            label="Payment Method *"
          />
        </div>

        {/* Payment Date */}
        <div>
          <TextInput
            label="Payment Date"
            type="date"
            value={formData.payment_date || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, payment_date: e.target.value })}
          />
        </div>

        {/* Reference Number */}
        <div>
          <TextInput
            label="Reference Number"
            type="text"
            value={formData.reference_number || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, reference_number: e.target.value })}
            placeholder="Check number, transaction ID, etc."
          />
        </div>

        {/* Notes */}
        <div>
          <Textarea
            label="Notes"
            value={formData.notes || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about this payment"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
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
            loading={loading}
            disabled={!isFormValid()}
          >
            Add Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 