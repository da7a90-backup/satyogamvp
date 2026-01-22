'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Check } from 'lucide-react';

interface Retreat {
  id: string;
  title: string;
  slug: string;
  price: number;
  retreat_type: string;
}

interface ApprovalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: {
    id: string;
    submitter_name: string;
    submitter_email: string;
    form_template_id: string;
  };
  onSuccess: () => void;
  accessToken: string;
}

export default function ApprovalPaymentModal({
  isOpen,
  onClose,
  submission,
  onSuccess,
  accessToken,
}: ApprovalPaymentModalProps) {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [selectedRetreatId, setSelectedRetreatId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'sending' | 'success'>('form');

  // Fetch available retreats
  useEffect(() => {
    if (isOpen) {
      fetchRetreats();
    }
  }, [isOpen]);

  const fetchRetreats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/retreats`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch retreats');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setRetreats(result.data);
      }
    } catch (err) {
      console.error('Error fetching retreats:', err);
      setError('Failed to load retreats');
    }
  };

  // Auto-fill payment amount when retreat is selected
  const handleRetreatChange = (retreatId: string) => {
    setSelectedRetreatId(retreatId);
    const selected = retreats.find((r) => r.id === retreatId);
    if (selected) {
      setPaymentAmount(selected.price.toFixed(2));
    }
  };

  const handleApprove = async () => {
    if (!selectedRetreatId) {
      setError('Please select a retreat');
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep('sending');

    try {
      // 1. Update submission status to "approved" with retreat info
      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/form-templates/submissions/${submission.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            status: 'approved',
            reviewer_notes: reviewerNotes,
            retreat_id: selectedRetreatId,
            payment_amount: parseFloat(paymentAmount),
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error('Failed to update submission');
      }

      // 2. Send email with payment link
      const selectedRetreat = retreats.find((r) => r.id === selectedRetreatId);
      const paymentUrl = `${window.location.origin}/dashboard/user/applications/payment/${submission.id}`;

      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/email/application-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            to_email: submission.submitter_email,
            name: submission.submitter_name,
            retreat_title: selectedRetreat?.title || 'Retreat',
            payment_amount: parseFloat(paymentAmount),
            payment_url: paymentUrl,
          }),
        }
      );

      if (!emailResponse.ok) {
        console.warn('Email sending failed, but submission was approved');
      }

      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 2000);
    } catch (err: any) {
      console.error('Error approving submission:', err);
      setError(err.message || 'Failed to approve submission');
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRetreatId('');
    setPaymentAmount('');
    setReviewerNotes('');
    setError(null);
    setStep('form');
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Approve Application & Send Payment Link
          </h2>
          {step === 'form' && (
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <>
              {/* Applicant Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Applicant Information</h3>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {submission.submitter_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {submission.submitter_email}
                </p>
              </div>

              {/* Retreat Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Retreat *
                </label>
                <select
                  value={selectedRetreatId}
                  onChange={(e) => handleRetreatChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">-- Select a retreat --</option>
                  {retreats.map((retreat) => (
                    <option key={retreat.id} value={retreat.id}>
                      {retreat.title} ({retreat.retreat_type}) - ${retreat.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Payment Amount (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  placeholder="0.00"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This amount will be auto-filled from the retreat price, but you can adjust it.
                </p>
              </div>

              {/* Reviewer Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Reviewer Notes (Optional)
                </label>
                <textarea
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  placeholder="Internal notes about this approval..."
                  disabled={isLoading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Info Message */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                <p className="font-semibold mb-1">What happens next:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Application status will be set to "approved"</li>
                  <li>Applicant will receive an email with a payment link</li>
                  <li>After payment, they'll automatically get retreat access</li>
                  <li>The order will appear in their "My Purchases" section</li>
                </ul>
              </div>
            </>
          )}

          {step === 'sending' && (
            <div className="py-12 text-center">
              <Loader2 className="h-12 w-12 text-[#7D1A13] mx-auto mb-4 animate-spin" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Processing Approval...
              </p>
              <p className="text-sm text-gray-600">
                Updating submission and sending payment link email
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Application Approved!
              </p>
              <p className="text-sm text-gray-600">
                Payment link has been sent to {submission.submitter_email}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={isLoading || !selectedRetreatId || !paymentAmount}
              className="px-6 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#7D1A13]/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve & Send Payment Link'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
