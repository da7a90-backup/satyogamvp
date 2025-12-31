"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'RETREAT' | 'COURSE' | 'WORKSHOP' | 'WEBINAR' | 'CEREMONY' | 'OTHER';
  start_datetime: string;
  end_datetime: string;
  location: string;
  thumbnail_url: string | null;
  is_published: boolean;
  is_recurring: boolean;
  recurrence_rule: string | null;
  max_participants: number | null;
  registration_url: string | null;
  created_at: string;
}

type EventFormData = Omit<Event, 'id' | 'created_at'>;

export default function EventsCalendarClient() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    slug: '',
    description: '',
    type: 'OTHER',
    start_datetime: '',
    end_datetime: '',
    location: '',
    thumbnail_url: null,
    is_published: false,
    is_recurring: false,
    recurrence_rule: null,
    max_participants: null,
    registration_url: null,
  });

  useEffect(() => {
    fetchEvents();
  }, [typeFilter]);

  const fetchEvents = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      let url = `${FASTAPI_URL}/api/events/admin/events`;

      if (typeFilter !== 'all') {
        url += `?event_type=${typeFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      type: 'OTHER',
      start_datetime: '',
      end_datetime: '',
      location: '',
      thumbnail_url: null,
      is_published: false,
      is_recurring: false,
      recurrence_rule: null,
      max_participants: null,
      registration_url: null,
    });
    setShowModal(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      slug: event.slug,
      description: event.description,
      type: event.type,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime,
      location: event.location,
      thumbnail_url: event.thumbnail_url,
      is_published: event.is_published,
      is_recurring: event.is_recurring,
      recurrence_rule: event.recurrence_rule,
      max_participants: event.max_participants,
      registration_url: event.registration_url,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const url = editingEvent
        ? `${FASTAPI_URL}/api/events/admin/events/${editingEvent.id}`
        : `${FASTAPI_URL}/api/events/admin/events`;

      const response = await fetch(url, {
        method: editingEvent ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/events/admin/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const togglePublished = async (event: Event) => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/events/admin/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          ...event,
          is_published: !event.is_published,
        }),
      });

      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error toggling published status:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar Events</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage retreats, courses, workshops, and other events
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#7D1A13] hover:bg-[#9d2419] text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <PlusIcon className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="retreat">Retreat</option>
            <option value="course">Course</option>
            <option value="workshop">Workshop</option>
            <option value="webinar">Webinar</option>
            <option value="ceremony">Ceremony</option>
            <option value="other">Other</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
        />
      </div>

      {/* Events Grid */}
      <div className="grid gap-4">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.type === 'RETREAT' ? 'bg-purple-100 text-purple-800' :
                    event.type === 'COURSE' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'WORKSHOP' ? 'bg-green-100 text-green-800' :
                    event.type === 'WEBINAR' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.type}
                  </span>
                  {event.is_published ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Draft
                    </span>
                  )}
                  {event.is_recurring && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Recurring
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {event.description.substring(0, 200)}{event.description.length > 200 && '...'}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {new Date(event.start_datetime).toLocaleString()} - {new Date(event.end_datetime).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {event.location}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => togglePublished(event)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    event.is_published
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                  title={event.is_published ? 'Unpublish' : 'Publish'}
                >
                  {event.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => openEditModal(event)}
                  className="text-[#7D1A13] hover:text-[#9d2419] p-2"
                  title="Edit"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            No events found
          </div>
        )}
      </div>

      {/* Create/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                />
              </div>

              {/* Type and Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  >
                    <option value="RETREAT">Retreat</option>
                    <option value="COURSE">Course</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="WEBINAR">Webinar</option>
                    <option value="CEREMONY">Ceremony</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Date/Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date/Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date/Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_datetime}
                    onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                />
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail_url || ''}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_participants || ''}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration URL
                </label>
                <input
                  type="url"
                  value={formData.registration_url || ''}
                  onChange={(e) => setFormData({ ...formData, registration_url: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded border-gray-300 text-[#7D1A13] focus:ring-[#7D1A13]"
                  />
                  <span className="text-sm text-gray-700">Published</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                    className="rounded border-gray-300 text-[#7D1A13] focus:ring-[#7D1A13]"
                  />
                  <span className="text-sm text-gray-700">Recurring Event</span>
                </label>
              </div>

              {/* Recurrence Rule */}
              {formData.is_recurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recurrence Rule (RFC 5545 format)
                  </label>
                  <input
                    type="text"
                    value={formData.recurrence_rule || ''}
                    onChange={(e) => setFormData({ ...formData, recurrence_rule: e.target.value || null })}
                    placeholder="e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Example: FREQ=WEEKLY;BYDAY=MO (Every Monday)
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7D1A13] hover:bg-[#9d2419] text-white rounded-lg font-medium transition"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
