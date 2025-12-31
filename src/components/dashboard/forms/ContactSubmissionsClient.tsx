"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  topic: string | null;
  message: string;
  submitted_at: string;
  responded_at: string | null;
  response: string | null;
}

export default function ContactSubmissionsClient() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState('');
  const [savingResponse, setSavingResponse] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const res = await fetch(`${FASTAPI_URL}/api/forms/admin/contact-submissions`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setResponse(submission.response || '');
    setShowModal(true);
  };

  const saveResponse = async () => {
    if (!selectedSubmission) return;

    setSavingResponse(true);
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const res = await fetch(
        `${FASTAPI_URL}/api/forms/admin/contact-submissions/${selectedSubmission.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ response }),
        }
      );

      if (res.ok) {
        setShowModal(false);
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setSavingResponse(false);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const res = await fetch(
        `${FASTAPI_URL}/api/forms/admin/contact-submissions/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (res.ok) {
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and respond to contact form submissions
        </p>
      </div>

      {/* Submissions Grid */}
      <div className="grid gap-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {submission.name}
                  </h3>
                  {submission.responded_at ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Responded
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Pending
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  <strong>Email:</strong> {submission.email}
                </div>

                {submission.topic && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Topic:</strong> {submission.topic}
                  </div>
                )}

                <div className="text-sm text-gray-700 mb-2">
                  <strong>Message:</strong>
                  <p className="mt-1">{submission.message.substring(0, 200)}{submission.message.length > 200 && '...'}</p>
                </div>

                <div className="text-xs text-gray-500">
                  Submitted: {new Date(submission.submitted_at).toLocaleString()}
                </div>

                {submission.responded_at && (
                  <div className="text-xs text-gray-500">
                    Responded: {new Date(submission.responded_at).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => viewSubmission(submission)}
                  className="text-[#7D1A13] hover:text-[#9d2419] p-2"
                  title="View/Respond"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteSubmission(submission.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {submissions.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            No contact submissions found
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Contact Submission</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Submitter Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSubmission.email}</p>
                  </div>
                </div>
                {selectedSubmission.topic && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">Topic</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSubmission.topic}</p>
                  </div>
                )}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700">Submitted</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedSubmission.submitted_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Response */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Response
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  placeholder="Write your response here (for internal tracking)..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveResponse}
                  disabled={savingResponse}
                  className="px-4 py-2 bg-[#7D1A13] hover:bg-[#9d2419] disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                >
                  {savingResponse ? 'Saving...' : 'Save Response'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
