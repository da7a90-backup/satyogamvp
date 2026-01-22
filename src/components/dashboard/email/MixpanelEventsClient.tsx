"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  BoltIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsEvent {
  id: string;
  event_name: string;
  event_properties: Record<string, any>;
  user_id: string | null;
  created_at: string;
}

const COMMON_EVENTS = [
  'User Signup',
  'User Login',
  'Teaching Viewed',
  'Course Enrolled',
  'Payment Completed',
  'Retreat Registered',
  'Page View',
];

export default function MixpanelEventsClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // TODO: Create backend endpoint to fetch analytics events
      // For now, showing placeholder data
      setEvents([]);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchEvents();
  };

  const handleCreateAutomation = (eventName: string) => {
    router.push(`/dashboard/admin/email/automations?prefill=${encodeURIComponent(eventName)}`);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = eventFilter === 'all' || event.event_name === eventFilter;
    return matchesSearch && matchesFilter;
  });

  const eventCounts = events.reduce((acc, event) => {
    acc[event.event_name] = (acc[event.event_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueEventNames = Array.from(new Set(events.map(e => e.event_name)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#737373]">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Mixpanel Events</h1>
            <p className="text-[#737373] mt-1">Browse analytics events to create automations</p>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Common Events Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1F2937] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Quick Actions - Common Events</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMMON_EVENTS.map((eventName) => (
            <div
              key={eventName}
              className="p-4 border-2 border-[#F3F4F6] rounded-lg hover:border-blue-300 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BoltIcon className="w-5 h-5 text-[#7D1A13]" />
                  <span className="font-medium text-[#1F2937]">{eventName}</span>
                </div>
                <span className="text-sm text-[#737373]">
                  {eventCounts[eventName] || 0} events
                </span>
              </div>

              <button
                onClick={() => handleCreateAutomation(eventName)}
                className="w-full flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Create Automation
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Event Type Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-[#737373]" />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Events</option>
              {uniqueEventNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BoltIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-[#1F2937] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>No Events Found</h3>
          <p className="text-[#737373] mb-4">
            {searchTerm || eventFilter !== 'all'
              ? 'No events match your filters'
              : 'Events will appear here as they are tracked in your application'}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
            <h4 className="font-semibold text-blue-900 mb-2">How Mixpanel Events Work:</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Events are tracked automatically throughout your application</li>
              <li>• Common events include user signups, logins, content views, and purchases</li>
              <li>• Use events to trigger automated email sequences</li>
              <li>• Create personalized user journeys based on behavior</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BoltIcon className="w-4 h-4 text-[#7D1A13]" />
                      <span className="text-sm font-medium text-[#1F2937]">{event.event_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(event.event_properties).slice(0, 3).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 text-xs bg-gray-100 text-[#374151] rounded"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                      {Object.keys(event.event_properties).length > 3 && (
                        <span className="px-2 py-1 text-xs text-[#737373]">
                          +{Object.keys(event.event_properties).length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#737373]">
                    {event.user_id ? (
                      <span className="text-[#1F2937]">{event.user_id.slice(0, 8)}...</span>
                    ) : (
                      <span className="text-gray-400">Anonymous</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#737373]">
                    {new Date(event.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleCreateAutomation(event.event_name)}
                      className="text-[#7D1A13] hover:text-blue-900"
                    >
                      Create Automation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination placeholder */}
      {filteredEvents.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-[#737373]">
          <div>Showing {filteredEvents.length} events</div>
        </div>
      )}
    </div>
  );
}
