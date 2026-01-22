"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  user_id: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  status: string;
  tags: string[];
  subscriber_metadata: Record<string, any>;
}

interface SubscriberDetailClientProps {
  subscriberId: string;
}

export default function SubscriberDetailClient({ subscriberId }: SubscriberDetailClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchSubscriber();
  }, [subscriberId]);

  const fetchSubscriber = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/subscribers`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        const subscribers = await response.json();
        const found = subscribers.find((s: Subscriber) => s.id === subscriberId);

        if (found) {
          setSubscriber(found);
        } else {
          alert('Subscriber not found');
          router.push('/dashboard/admin/email/subscribers');
        }
      }
    } catch (error) {
      console.error('Error fetching subscriber:', error);
      alert('Failed to load subscriber');
      router.push('/dashboard/admin/email/subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!subscriber) return;

    if (!confirm(`Unsubscribe ${subscriber.email}?`)) {
      return;
    }

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/newsletter/unsubscribe?email=${subscriber.email}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        alert('Subscriber unsubscribed successfully');
        fetchSubscriber();
      } else {
        alert('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      alert('Failed to unsubscribe');
    }
  };

  const handleResubscribe = async () => {
    if (!subscriber) return;

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: subscriber.email,
          name: subscriber.name,
        }),
      });

      if (response.ok) {
        alert('Subscriber resubscribed successfully');
        fetchSubscriber();
      } else {
        alert('Failed to resubscribe');
      }
    } catch (error) {
      console.error('Error resubscribing:', error);
      alert('Failed to resubscribe');
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;

    // TODO: Implement tag addition API endpoint
    alert('Tag management API coming soon!');
    setNewTag('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#737373]">Loading subscriber...</div>
      </div>
    );
  }

  if (!subscriber) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#737373]">Subscriber not found</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      unsubscribed: 'bg-gray-100 text-[#1F2937]',
      bounced: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${colors[status as keyof typeof colors] || colors.active}`}>
        {status === 'active' ? (
          <CheckCircleIcon className="w-4 h-4" />
        ) : (
          <XCircleIcon className="w-4 h-4" />
        )}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/admin/email/subscribers')}
          className="flex items-center text-[#737373] hover:text-[#1F2937] mb-4"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Back to Subscribers
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#1F2937] mb-2">{subscriber.email}</h1>
            {subscriber.name && (
              <p className="text-[#737373]">{subscriber.name}</p>
            )}
            <div className="mt-2">{getStatusBadge(subscriber.status)}</div>
          </div>

          <div className="flex gap-2">
            {subscriber.status === 'active' ? (
              <button
                onClick={handleUnsubscribe}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Unsubscribe
              </button>
            ) : (
              <button
                onClick={handleResubscribe}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Resubscribe
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            <EnvelopeIcon className="w-5 h-5" />
            Profile Information
          </h2>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-[#737373]">Email:</span>
              <p className="font-medium text-[#1F2937]">{subscriber.email}</p>
            </div>

            {subscriber.name && (
              <div>
                <span className="text-sm text-[#737373]">Name:</span>
                <p className="font-medium text-[#1F2937]">{subscriber.name}</p>
              </div>
            )}

            <div>
              <span className="text-sm text-[#737373]">Status:</span>
              <p className="font-medium text-[#1F2937]">{subscriber.status}</p>
            </div>

            {subscriber.user_id && (
              <div>
                <span className="text-sm text-[#737373]">User Account:</span>
                <p className="font-medium text-[#1F2937]">Linked</p>
              </div>
            )}
          </div>
        </div>

        {/* Subscription History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            <CalendarIcon className="w-5 h-5" />
            Subscription History
          </h2>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-[#737373]">Subscribed:</span>
              <p className="font-medium text-[#1F2937]">
                {new Date(subscriber.subscribed_at).toLocaleString()}
              </p>
            </div>

            {subscriber.unsubscribed_at && (
              <div>
                <span className="text-sm text-[#737373]">Unsubscribed:</span>
                <p className="font-medium text-[#1F2937]">
                  {new Date(subscriber.unsubscribed_at).toLocaleString()}
                </p>
              </div>
            )}

            <div>
              <span className="text-sm text-[#737373]">Duration:</span>
              <p className="font-medium text-[#1F2937]">
                {(() => {
                  const start = new Date(subscriber.subscribed_at);
                  const end = subscriber.unsubscribed_at
                    ? new Date(subscriber.unsubscribed_at)
                    : new Date();
                  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                  return `${days} days`;
                })()}
              </p>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            <TagIcon className="w-5 h-5" />
            Tags
          </h2>

          <div className="flex flex-wrap gap-2 mb-4">
            {subscriber.tags && subscriber.tags.length > 0 ? (
              subscriber.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))
            ) : (
              <p className="text-sm text-[#737373]">No tags assigned</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag();
                }
              }}
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition text-sm"
            >
              Add
            </button>
          </div>
        </div>

        {/* Email History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center justify-between" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            <span>Email History</span>
            <span className="text-sm font-normal text-[#737373]">
              {(() => {
                // Simulate email history data
                const mockEmails = [
                  {
                    id: '1',
                    campaign: 'Welcome Series - Day 1',
                    subject: 'Welcome to SatyoGam!',
                    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    opened: true,
                    clicked: true,
                    opened_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
                  },
                  {
                    id: '2',
                    campaign: 'Monthly Newsletter',
                    subject: 'New Teachings This Month',
                    sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    opened: true,
                    clicked: false,
                    opened_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 7200000).toISOString(),
                  },
                  {
                    id: '3',
                    campaign: 'Retreat Announcement',
                    subject: 'Join Our Online Retreat',
                    sent_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                    opened: false,
                    clicked: false,
                  },
                ];
                return `${mockEmails.length} emails`;
              })()}
            </span>
          </h2>

          <div className="space-y-3">
            {(() => {
              // Simulate email history data
              const mockEmails = [
                {
                  id: '1',
                  campaign: 'Welcome Series - Day 1',
                  subject: 'Welcome to SatyoGam!',
                  sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                  opened: true,
                  clicked: true,
                  opened_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
                },
                {
                  id: '2',
                  campaign: 'Monthly Newsletter',
                  subject: 'New Teachings This Month',
                  sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                  opened: true,
                  clicked: false,
                  opened_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 7200000).toISOString(),
                },
                {
                  id: '3',
                  campaign: 'Retreat Announcement',
                  subject: 'Join Our Online Retreat',
                  sent_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                  opened: false,
                  clicked: false,
                },
                {
                  id: '4',
                  campaign: 'Course Enrollment',
                  subject: 'Check Out Our Latest Course',
                  sent_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                  opened: true,
                  clicked: true,
                  opened_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 1800000).toISOString(),
                },
              ];

              return mockEmails.map((email) => (
                <div key={email.id} className="border border-[#F3F4F6] rounded-lg p-4 hover:border-blue-300 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-[#1F2937]">{email.subject}</h4>
                      <p className="text-sm text-[#737373]">{email.campaign}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {email.opened ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                          <CheckCircleIcon className="w-3 h-3" />
                          Opened
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-[#737373] rounded-full flex items-center gap-1">
                          <XCircleIcon className="w-3 h-3" />
                          Not Opened
                        </span>
                      )}
                      {email.clicked && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Clicked
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#737373]">
                    <div>
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      Sent: {new Date(email.sent_at).toLocaleDateString()}
                    </div>
                    {email.opened_at && (
                      <div>
                        <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                        Opened: {new Date(email.opened_at).toLocaleDateString()} at {new Date(email.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>

                  {/* Engagement Timeline */}
                  {email.opened && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
                        </div>
                        <span className="text-[#737373]">
                          {Math.floor((new Date(email.opened_at!).getTime() - new Date(email.sent_at).getTime()) / 60000)} min to open
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>

          {/* Engagement Stats */}
          <div className="mt-6 pt-6 border-t border-[#F3F4F6]">
            <h4 className="text-sm font-semibold text-[#1F2937] mb-3">Engagement Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  {(() => {
                    const mockEmails = [
                      { opened: true },
                      { opened: true },
                      { opened: false },
                      { opened: true },
                    ];
                    const openRate = (mockEmails.filter(e => e.opened).length / mockEmails.length) * 100;
                    return `${openRate.toFixed(0)}%`;
                  })()}
                </div>
                <div className="text-xs text-[#737373] mt-1">Open Rate</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  {(() => {
                    const mockEmails = [
                      { clicked: true },
                      { clicked: false },
                      { clicked: false },
                      { clicked: true },
                    ];
                    const clickRate = (mockEmails.filter(e => e.clicked).length / mockEmails.length) * 100;
                    return `${clickRate.toFixed(0)}%`;
                  })()}
                </div>
                <div className="text-xs text-[#737373] mt-1">Click Rate</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>4</div>
                <div className="text-xs text-[#737373] mt-1">Total Emails</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      {subscriber.subscriber_metadata && Object.keys(subscriber.subscriber_metadata).length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Additional Information</h2>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(subscriber.subscriber_metadata).map(([key, value]) => (
              <div key={key}>
                <span className="text-sm text-[#737373]">{key}:</span>
                <p className="font-medium text-[#1F2937]">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
