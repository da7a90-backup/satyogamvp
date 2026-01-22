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
  ClockIcon,
  VideoCameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Types matching backend
type EventType = 'satsang' | 'book_group' | 'live_event' | 'retreat' | 'course';
type LocationType = 'online' | 'onsite';
type EventStructure = 'simple_recurring' | 'day_by_day' | 'week_by_week';

interface EventSession {
  id?: string;
  session_number: number;
  title: string;
  description?: string;
  session_date?: string;
  start_time?: string;
  duration_minutes?: number;
  content?: string;
  video_url?: string;
  audio_url?: string;
  materials_url?: string;
  zoom_link?: string;
  is_published: boolean;
}

interface Event {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: EventType;
  location_type: LocationType;
  location?: string;
  start_datetime?: string;
  end_datetime?: string;
  duration_minutes?: number;
  event_structure: EventStructure;
  is_recurring: boolean;
  recurrence_rule?: string;
  zoom_link?: string;
  meeting_id?: string;
  meeting_password?: string;
  max_participants?: number;
  registration_required: boolean;
  registration_url?: string;
  thumbnail_url?: string;
  is_published: boolean;
  sessions?: EventSession[];
  created_at: string;
  updated_at: string;
}

type EventFormData = Omit<Event, 'id' | 'created_at' | 'updated_at'>;

const defaultFormData: EventFormData = {
  slug: '',
  title: '',
  description: '',
  type: 'live_event',
  location_type: 'online',
  location: '',
  start_datetime: '',
  end_datetime: '',
  duration_minutes: 60,
  event_structure: 'simple_recurring',
  is_recurring: false,
  recurrence_rule: '',
  zoom_link: '',
  meeting_id: '',
  meeting_password: '',
  max_participants: undefined,
  registration_required: false,
  registration_url: '',
  thumbnail_url: '',
  is_published: false,
  sessions: [],
};

export default function EventsCalendarClient() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);

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
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData(defaultFormData);
    setShowModal(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      slug: event.slug,
      title: event.title,
      description: event.description || '',
      type: event.type,
      location_type: event.location_type,
      location: event.location || '',
      start_datetime: event.start_datetime || '',
      end_datetime: event.end_datetime || '',
      duration_minutes: event.duration_minutes || 60,
      event_structure: event.event_structure,
      is_recurring: event.is_recurring,
      recurrence_rule: event.recurrence_rule || '',
      zoom_link: event.zoom_link || '',
      meeting_id: event.meeting_id || '',
      meeting_password: event.meeting_password || '',
      max_participants: event.max_participants,
      registration_required: event.registration_required,
      registration_url: event.registration_url || '',
      thumbnail_url: event.thumbnail_url || '',
      is_published: event.is_published,
      sessions: event.sessions || [],
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
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        fetchEvents();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Failed to save event'}`);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This will also delete all associated sessions.')) return;

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/events/admin/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const addSession = () => {
    const newSession: EventSession = {
      session_number: (formData.sessions?.length || 0) + 1,
      title: '',
      description: '',
      session_date: '',
      start_time: '',
      duration_minutes: formData.duration_minutes || 60,
      content: '',
      video_url: '',
      audio_url: '',
      materials_url: '',
      zoom_link: formData.zoom_link || '',
      is_published: true,
    };
    setFormData({
      ...formData,
      sessions: [...(formData.sessions || []), newSession],
    });
  };

  const removeSession = (index: number) => {
    setFormData({
      ...formData,
      sessions: formData.sessions?.filter((_, i) => i !== index) || [],
    });
  };

  const updateSession = (index: number, field: keyof EventSession, value: any) => {
    const updatedSessions = [...(formData.sessions || [])];
    updatedSessions[index] = {
      ...updatedSessions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      sessions: updatedSessions,
    });
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
            Manage events with day-by-day, week-by-week, and recurring structures
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
            <option value="satsang">Satsang</option>
            <option value="book_group">Book Group</option>
            <option value="live_event">Live Event</option>
            <option value="retreat">Retreat</option>
            <option value="course">Course</option>
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

                  {/* Event Type Badge */}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {event.type.replace('_', ' ')}
                  </span>

                  {/* Location Type Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.location_type === 'online'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {event.location_type}
                  </span>

                  {/* Structure Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.event_structure === 'simple_recurring'
                      ? 'bg-indigo-100 text-indigo-800'
                      : event.event_structure === 'day_by_day'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {event.event_structure.replace('_', ' ')}
                  </span>

                  {/* Published Status */}
                  {event.is_published ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Draft
                    </span>
                  )}

                  {/* Sessions Count */}
                  {event.sessions && event.sessions.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {event.sessions.length} sessions
                    </span>
                  )}
                </div>

                {event.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {event.description.substring(0, 200)}{event.description.length > 200 && '...'}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {event.start_datetime && (
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {new Date(event.start_datetime).toLocaleString()}
                      {event.end_datetime && ` - ${new Date(event.end_datetime).toLocaleString()}`}
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {event.location}
                    </div>
                  )}
                  {event.zoom_link && (
                    <div className="flex items-center gap-1">
                      <VideoCameraIcon className="w-4 h-4" />
                      Zoom link configured
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
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
            No events found. Create your first event to get started.
          </div>
        )}
      </div>

      {/* Create/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    >
                      <option value="satsang">Satsang</option>
                      <option value="book_group">Book Group</option>
                      <option value="live_event">Live Event</option>
                      <option value="retreat">Retreat</option>
                      <option value="course">Course</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Structure and Location */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Structure & Location</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Structure *
                    </label>
                    <select
                      required
                      value={formData.event_structure}
                      onChange={(e) => setFormData({ ...formData, event_structure: e.target.value as EventStructure })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    >
                      <option value="simple_recurring">Simple Recurring (e.g., Sunday Meditation)</option>
                      <option value="day_by_day">Day by Day (e.g., Online Retreat)</option>
                      <option value="week_by_week">Week by Week (e.g., Book Group)</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.event_structure === 'simple_recurring' && 'Regular recurring events with same format each time'}
                      {formData.event_structure === 'day_by_day' && 'Events with different content each day'}
                      {formData.event_structure === 'week_by_week' && 'Events with different topics each week'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location Type *
                    </label>
                    <select
                      required
                      value={formData.location_type}
                      onChange={(e) => setFormData({ ...formData, location_type: e.target.value as LocationType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    >
                      <option value="online">Online</option>
                      <option value="onsite">Onsite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location {formData.location_type === 'onsite' && '*'}
                    </label>
                    <input
                      type="text"
                      required={formData.location_type === 'onsite'}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder={formData.location_type === 'online' ? 'Optional location name' : 'Physical address'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration_minutes || ''}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Online Settings (Zoom) */}
              {formData.location_type === 'online' && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900">Online Meeting Settings</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zoom Link
                      </label>
                      <input
                        type="url"
                        value={formData.zoom_link}
                        onChange={(e) => setFormData({ ...formData, zoom_link: e.target.value })}
                        placeholder="https://zoom.us/j/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meeting ID
                      </label>
                      <input
                        type="text"
                        value={formData.meeting_id}
                        onChange={(e) => setFormData({ ...formData, meeting_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meeting Password
                      </label>
                      <input
                        type="text"
                        value={formData.meeting_password}
                        onChange={(e) => setFormData({ ...formData, meeting_password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Timing and Recurrence */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Timing & Recurrence</h3>

                <div className="grid grid-cols-2 gap-4">
                  {formData.event_structure !== 'simple_recurring' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date/Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.start_datetime}
                          onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date/Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.end_datetime}
                          onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                        />
                      </div>
                    </>
                  )}

                  <div className="col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_recurring}
                        onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                        className="rounded border-gray-300 text-[#7D1A13] focus:ring-[#7D1A13]"
                      />
                      <span className="text-sm font-medium text-gray-700">Recurring Event</span>
                    </label>
                  </div>

                  {formData.is_recurring && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recurrence Rule (RFC 5545 format)
                      </label>
                      <input
                        type="text"
                        value={formData.recurrence_rule}
                        onChange={(e) => setFormData({ ...formData, recurrence_rule: e.target.value })}
                        placeholder="e.g., FREQ=WEEKLY;BYDAY=SU"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Examples: FREQ=WEEKLY;BYDAY=SU (Every Sunday) | FREQ=WEEKLY;BYDAY=MO,WE,FR (Mon/Wed/Fri)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sessions (for day_by_day and week_by_week) */}
              {(formData.event_structure === 'day_by_day' || formData.event_structure === 'week_by_week') && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formData.event_structure === 'day_by_day' ? 'Daily Sessions' : 'Weekly Topics'}
                    </h3>
                    <button
                      type="button"
                      onClick={addSession}
                      className="flex items-center gap-1 text-sm bg-[#7D1A13] hover:bg-[#9d2419] text-white px-3 py-1.5 rounded"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add {formData.event_structure === 'day_by_day' ? 'Day' : 'Week'}
                    </button>
                  </div>

                  {formData.sessions && formData.sessions.length > 0 ? (
                    <div className="space-y-4">
                      {formData.sessions.map((session, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-gray-900">
                              {formData.event_structure === 'day_by_day' ? `Day ${session.session_number}` : `Week ${session.session_number}`}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeSession(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={session.title}
                                onChange={(e) => updateSession(index, 'title', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                              />
                            </div>

                            {formData.event_structure === 'day_by_day' && (
                              <>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Session Date
                                  </label>
                                  <input
                                    type="date"
                                    value={session.session_date}
                                    onChange={(e) => updateSession(index, 'session_date', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Start Time
                                  </label>
                                  <input
                                    type="time"
                                    value={session.start_time}
                                    onChange={(e) => updateSession(index, 'start_time', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                                  />
                                </div>
                              </>
                            )}

                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <textarea
                                rows={2}
                                value={session.description}
                                onChange={(e) => updateSession(index, 'description', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                              />
                            </div>

                            {formData.location_type === 'online' && (
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Zoom Link (override)
                                </label>
                                <input
                                  type="url"
                                  value={session.zoom_link}
                                  onChange={(e) => updateSession(index, 'zoom_link', e.target.value)}
                                  placeholder="Leave empty to use event-level zoom link"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded border border-gray-200">
                      No sessions yet. Click &quot;Add {formData.event_structure === 'day_by_day' ? 'Day' : 'Week'}&quot; to create the first session.
                    </p>
                  )}
                </div>
              )}

              {/* Registration & Publishing */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Registration & Publishing</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_participants || ''}
                      onChange={(e) => setFormData({ ...formData, max_participants: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thumbnail URL
                    </label>
                    <input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.registration_required}
                        onChange={(e) => setFormData({ ...formData, registration_required: e.target.checked })}
                        className="rounded border-gray-300 text-[#7D1A13] focus:ring-[#7D1A13]"
                      />
                      <span className="text-sm font-medium text-gray-700">Registration Required</span>
                    </label>
                  </div>

                  {formData.registration_required && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration URL
                      </label>
                      <input
                        type="url"
                        value={formData.registration_url}
                        onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      />
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                        className="rounded border-gray-300 text-[#7D1A13] focus:ring-[#7D1A13]"
                      />
                      <span className="text-sm font-medium text-gray-700">Publish Event</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
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
