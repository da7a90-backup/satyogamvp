"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import ApprovalPaymentModal from '@/components/forms/ApprovalPaymentModal';

interface FormSubmission {
  id: string;
  form_template_id: string;
  user_id: string | null;
  answers: Record<string, any>;
  files: Record<string, any> | null;
  submitter_email: string | null;
  submitter_name: string | null;
  status: 'pending' | 'reviewed' | 'approved' | 'payment_sent' | 'paid' | 'rejected';
  reviewer_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  retreat_id: string | null;
  payment_amount: number | null;
  payment_id: string | null;
  order_id: string | null;
  payment_link_sent_at: string | null;
}

export default function RetreatApplicationsClient() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<FormSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

      // Fetch retreat application forms
      // TODO: Replace with form_template_id for retreat applications when we have them seeded
      let url = `${FASTAPI_URL}/api/form-templates/submissions/all`;

      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setApplications(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewApplication = (application: FormSubmission) => {
    setSelectedApplication(application);
    setNotes(application.reviewer_notes || '');
    setShowModal(true);
  };

  const openApprovalModal = (application: FormSubmission) => {
    setSelectedApplication(application);
    setShowApprovalModal(true);
  };

  const updateApplicationStatus = async (status: FormSubmission['status']) => {
    if (!selectedApplication) return;

    setUpdatingStatus(true);
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(
        `${FASTAPI_URL}/api/form-templates/submissions/${selectedApplication.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify({ status, reviewer_notes: notes }),
        }
      );

      if (response.ok) {
        setShowModal(false);
        fetchApplications();
      }
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      payment_sent: 'bg-purple-100 text-purple-800',
      paid: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
    };

    const labels = {
      pending: 'Pending',
      reviewed: 'Reviewed',
      approved: 'Approved',
      payment_sent: 'Payment Sent',
      paid: 'Paid',
      rejected: 'Rejected',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { className: "w-5 h-5" };

    switch (status) {
      case 'approved':
        return <CheckCircleIcon {...iconProps} className="text-green-600 w-5 h-5" />;
      case 'payment_sent':
        return <CurrencyDollarIcon {...iconProps} className="text-purple-600 w-5 h-5" />;
      case 'paid':
        return <CheckCircleIcon {...iconProps} className="text-emerald-600 w-5 h-5" />;
      case 'rejected':
        return <XCircleIcon {...iconProps} className="text-red-600 w-5 h-5" />;
      case 'pending':
        return <ClockIcon {...iconProps} className="text-yellow-600 w-5 h-5" />;
      default:
        return <ClockIcon {...iconProps} className="text-blue-600 w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Retreat Applications</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and review retreat application submissions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-4">
        <FunnelIcon className="w-5 h-5 text-gray-500" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="zoom_scheduled">Zoom Scheduled</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
        >
          <option value="all">All Retreats</option>
          <option value="shakti">Shakti</option>
          <option value="darshan">Darshan</option>
          <option value="sevadhari">Sevadhari</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr key={application.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {application.submitter_name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {application.submitter_email || 'No email'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Retreat Application
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    {getStatusBadge(application.status)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(application.submitted_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => viewApplication(application)}
                    className="text-[#7D1A13] hover:text-[#9d2419] flex items-center gap-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No applications found
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status
                </label>
                {getStatusBadge(selectedApplication.status)}
              </div>

              {/* Application Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Information
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(selectedApplication.answers, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Payment Info (if applicable) */}
              {selectedApplication.payment_amount && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Payment Information</h4>
                  <p className="text-sm text-purple-800">
                    <strong>Amount:</strong> ${selectedApplication.payment_amount.toFixed(2)}
                  </p>
                  {selectedApplication.payment_link_sent_at && (
                    <p className="text-sm text-purple-800">
                      <strong>Link Sent:</strong> {new Date(selectedApplication.payment_link_sent_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  placeholder="Add notes about this application..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {selectedApplication.status === 'pending' || selectedApplication.status === 'reviewed' ? (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      openApprovalModal(selectedApplication);
                    }}
                    disabled={updatingStatus}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <CurrencyDollarIcon className="w-5 h-5" />
                    Approve & Send Payment Link
                  </button>
                ) : (
                  <div className="flex-1 text-center text-sm text-gray-600 py-2">
                    Payment link already sent or status changed
                  </div>
                )}
                <button
                  onClick={() => updateApplicationStatus('rejected')}
                  disabled={updatingStatus}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => updateApplicationStatus('reviewed')}
                  disabled={updatingStatus}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Mark Reviewed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Payment Modal */}
      {showApprovalModal && selectedApplication && session?.user?.accessToken && (
        <ApprovalPaymentModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          submission={{
            id: selectedApplication.id,
            submitter_name: selectedApplication.submitter_name || 'Unknown',
            submitter_email: selectedApplication.submitter_email || '',
            form_template_id: selectedApplication.form_template_id,
          }}
          onSuccess={() => {
            setShowApprovalModal(false);
            fetchApplications();
          }}
          accessToken={session.user.accessToken}
        />
      )}
    </div>
  );
}
