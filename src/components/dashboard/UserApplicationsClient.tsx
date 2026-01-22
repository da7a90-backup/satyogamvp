'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

interface FormSubmission {
  id: string;
  form_template_id: string;
  user_id: string;
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

interface UserApplicationsClientProps {
  session: Session;
}

export default function UserApplicationsClient({ session }: UserApplicationsClientProps) {
  const [applications, setApplications] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<FormSubmission | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/form-templates/my-submissions`,
        {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
        }
      );

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
      pending: 'Pending Review',
      reviewed: 'Under Review',
      approved: 'Approved - Payment Required',
      payment_sent: 'Payment Link Sent',
      paid: 'Paid - Confirmed',
      rejected: 'Not Approved',
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
      case 'payment_sent':
        return <CurrencyDollarIcon {...iconProps} className="text-purple-600 w-5 h-5" />;
      case 'paid':
        return <CheckCircleIcon {...iconProps} className="text-emerald-600 w-5 h-5" />;
      case 'rejected':
        return <XCircleIcon {...iconProps} className="text-red-600 w-5 h-5" />;
      case 'pending':
      case 'reviewed':
        return <ClockIcon {...iconProps} className="text-yellow-600 w-5 h-5" />;
      default:
        return <ClockIcon {...iconProps} className="text-blue-600 w-5 h-5" />;
    }
  };

  const handlePayment = (applicationId: string) => {
    router.push(`/dashboard/user/applications/payment/${applicationId}`);
  };

  const viewApplication = (application: FormSubmission) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-[#7D1A13] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track the status of your retreat and program applications
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">You haven't submitted any applications yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application
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
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {application.submitter_name || 'Application'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {application.submitter_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(application.status)}
                      {getStatusBadge(application.status)}
                    </div>
                    {application.payment_amount && (
                      <div className="text-xs text-gray-500 mt-1">
                        Amount: ${application.payment_amount.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewApplication(application)}
                        className="text-[#7D1A13] hover:text-[#9d2419] flex items-center gap-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View
                      </button>
                      {(application.status === 'approved' || application.status === 'payment_sent') && application.payment_amount && (
                        <button
                          onClick={() => handlePayment(application.id)}
                          className="ml-2 px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#7D1A13]/90 flex items-center gap-1"
                        >
                          <CurrencyDollarIcon className="w-4 h-4" />
                          Pay Now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedApplication.status)}
                  {getStatusBadge(selectedApplication.status)}
                </div>
              </div>

              {/* Payment Info */}
              {selectedApplication.payment_amount && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Payment Information</h4>
                  <p className="text-sm text-purple-800">
                    <strong>Amount Due:</strong> ${selectedApplication.payment_amount.toFixed(2)}
                  </p>
                  {selectedApplication.payment_link_sent_at && (
                    <p className="text-sm text-purple-800">
                      <strong>Payment Link Sent:</strong> {new Date(selectedApplication.payment_link_sent_at).toLocaleString()}
                    </p>
                  )}
                  {(selectedApplication.status === 'approved' || selectedApplication.status === 'payment_sent') && (
                    <button
                      onClick={() => {
                        setShowModal(false);
                        handlePayment(selectedApplication.id);
                      }}
                      className="mt-3 w-full py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#7D1A13]/90 font-medium flex items-center justify-center gap-2"
                    >
                      <CurrencyDollarIcon className="w-5 h-5" />
                      Complete Payment
                    </button>
                  )}
                </div>
              )}

              {/* Submission Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Details
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Submitted:</strong> {new Date(selectedApplication.submitted_at).toLocaleString()}
                  </p>
                  {selectedApplication.reviewed_at && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Reviewed:</strong> {new Date(selectedApplication.reviewed_at).toLocaleString()}
                    </p>
                  )}
                  {selectedApplication.reviewer_notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {selectedApplication.reviewer_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Your Answers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answers
                </label>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(selectedApplication.answers, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
