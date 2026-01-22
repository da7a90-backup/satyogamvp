'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react';

interface Session {
  session_title: string;
  description?: string;
  date?: string;
  time?: string;
  duration?: number;
  type?: string;
  has_audio: boolean;
  has_video: boolean;
  teaching_id?: string;
  youtube_live_id?: string;
  thumbnail_url?: string;
  zoom_link?: string;
  is_text: boolean;
}

interface Day {
  title: string;
  day_number: number;
  date?: string;
  day_label?: string;
  sessions: Session[];
}

interface PortalEditorProps {
  retreatId: string;
}

export default function PortalEditor({ retreatId }: PortalEditorProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retreat, setRetreat] = useState<any>(null);
  const [portalTitle, setPortalTitle] = useState('Main Portal');
  const [portalDescription, setPortalDescription] = useState('');
  const [days, setDays] = useState<Day[]>([]);
  const [expandedDays, setExpandedDays] = useState<number[]>([]);

  useEffect(() => {
    loadRetreat();
  }, [retreatId, session]);

  const loadRetreat = async () => {
    try {
      setLoading(true);
      const token = session?.user?.accessToken || localStorage.getItem('authToken');

      // Load retreat details
      const retreatResponse = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/retreats/${retreatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (retreatResponse.ok) {
        const retreatData = await retreatResponse.json();
        setRetreat(retreatData);

        // If retreat has portals, load the first one
        if (retreatData.portals && retreatData.portals.length > 0) {
          const portal = retreatData.portals[0];
          setPortalTitle(portal.title || 'Main Portal');
          setPortalDescription(portal.description || '');
          if (portal.content && portal.content.days) {
            setDays(portal.content.days);
            setExpandedDays(portal.content.days.map((_: any, idx: number) => idx));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load retreat:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDay = () => {
    const newDay: Day = {
      title: `Day ${days.length + 1}`,
      day_number: days.length + 1,
      date: '',
      day_label: '',
      sessions: [],
    };
    setDays([...days, newDay]);
    setExpandedDays([...expandedDays, days.length]);
  };

  const removeDay = (dayIndex: number) => {
    if (confirm('Are you sure you want to remove this day and all its sessions?')) {
      setDays(days.filter((_, idx) => idx !== dayIndex));
      setExpandedDays(expandedDays.filter(idx => idx !== dayIndex));
    }
  };

  const updateDay = (dayIndex: number, field: keyof Day, value: any) => {
    const updatedDays = [...days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value };
    setDays(updatedDays);
  };

  const addSession = (dayIndex: number) => {
    const newSession: Session = {
      session_title: '',
      description: '',
      time: '',
      duration: 60,
      type: 'teaching',
      has_audio: false,
      has_video: true,
      teaching_id: '',
      youtube_live_id: '',
      is_text: false,
    };
    const updatedDays = [...days];
    updatedDays[dayIndex].sessions.push(newSession);
    setDays(updatedDays);
  };

  const removeSession = (dayIndex: number, sessionIndex: number) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].sessions = updatedDays[dayIndex].sessions.filter(
      (_, idx) => idx !== sessionIndex
    );
    setDays(updatedDays);
  };

  const updateSession = (dayIndex: number, sessionIndex: number, field: keyof Session, value: any) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].sessions[sessionIndex] = {
      ...updatedDays[dayIndex].sessions[sessionIndex],
      [field]: value,
    };
    setDays(updatedDays);
  };

  const toggleDayExpanded = (dayIndex: number) => {
    if (expandedDays.includes(dayIndex)) {
      setExpandedDays(expandedDays.filter(idx => idx !== dayIndex));
    } else {
      setExpandedDays([...expandedDays, dayIndex]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = session?.user?.accessToken || localStorage.getItem('authToken');

      const portalData = {
        title: portalTitle,
        description: portalDescription,
        content: { days },
        order_index: 0,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/admin/retreats/${retreatId}/portals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(portalData),
        }
      );

      if (response.ok) {
        alert('Portal saved successfully!');
        router.push('/dashboard/admin/retreats');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to save portal');
      }
    } catch (error) {
      console.error('Failed to save portal:', error);
      alert('Failed to save portal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={() => router.push('/dashboard/admin/retreats')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            Portal Editor
          </h1>
          <p className="text-[#717680] mt-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {retreat?.title || 'Loading...'}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Portal
            </span>
          )}
        </Button>
      </div>

      {/* Portal Basic Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-[#000000] mb-4" style={{ fontFamily: 'Optima, serif' }}>
          Portal Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#000000] mb-2">
              Portal Title
            </label>
            <input
              type="text"
              value={portalTitle}
              onChange={(e) => setPortalTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#000000] mb-2">
              Description
            </label>
            <textarea
              value={portalDescription}
              onChange={(e) => setPortalDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-4 mb-6">
        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-white rounded-lg shadow-sm">
            {/* Day Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <button
                onClick={() => toggleDayExpanded(dayIndex)}
                className="flex items-center gap-3 flex-1"
              >
                {expandedDays.includes(dayIndex) ? (
                  <ChevronUp className="w-5 h-5 text-[#717680]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#717680]" />
                )}
                <div className="text-left">
                  <h3 className="text-lg font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
                    {day.title || `Day ${dayIndex + 1}`}
                  </h3>
                  {day.date && (
                    <p className="text-sm text-[#717680]">{day.date}</p>
                  )}
                </div>
              </button>
              <Button
                onClick={() => removeDay(dayIndex)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Day Content (Expanded) */}
            {expandedDays.includes(dayIndex) && (
              <div className="p-6 space-y-6">
                {/* Day Details */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#000000] mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => updateDay(dayIndex, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#000000] mb-2">
                      Day Number
                    </label>
                    <input
                      type="number"
                      value={day.day_number}
                      onChange={(e) => updateDay(dayIndex, 'day_number', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#000000] mb-2">
                      Date
                    </label>
                    <input
                      type="text"
                      value={day.date || ''}
                      onChange={(e) => updateDay(dayIndex, 'date', e.target.value)}
                      placeholder="e.g., Dec 27, 2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#000000] mb-2">
                      Label
                    </label>
                    <input
                      type="text"
                      value={day.day_label || ''}
                      onChange={(e) => updateDay(dayIndex, 'day_label', e.target.value)}
                      placeholder="e.g., Opening"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Sessions */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-bold text-[#000000]">Sessions</h4>
                    <Button
                      onClick={() => addSession(dayIndex)}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Session
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {day.sessions.map((session, sessionIndex) => (
                      <div
                        key={sessionIndex}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="text-sm font-bold text-[#000000]">
                            Session {sessionIndex + 1}
                          </h5>
                          <Button
                            onClick={() => removeSession(dayIndex, sessionIndex)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-[#000000] mb-1">
                              Session Title *
                            </label>
                            <input
                              type="text"
                              value={session.session_title}
                              onChange={(e) =>
                                updateSession(dayIndex, sessionIndex, 'session_title', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-[#000000] mb-1">
                              Description
                            </label>
                            <textarea
                              value={session.description || ''}
                              onChange={(e) =>
                                updateSession(dayIndex, sessionIndex, 'description', e.target.value)
                              }
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#000000] mb-1">
                              Time
                            </label>
                            <input
                              type="text"
                              value={session.time || ''}
                              onChange={(e) =>
                                updateSession(dayIndex, sessionIndex, 'time', e.target.value)
                              }
                              placeholder="e.g., 6:00 AM"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#000000] mb-1">
                              Duration (minutes)
                            </label>
                            <input
                              type="number"
                              value={session.duration || ''}
                              onChange={(e) =>
                                updateSession(dayIndex, sessionIndex, 'duration', parseInt(e.target.value))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#000000] mb-1">
                              Type
                            </label>
                            <input
                              type="text"
                              value={session.type || ''}
                              onChange={(e) =>
                                updateSession(dayIndex, sessionIndex, 'type', e.target.value)
                              }
                              placeholder="e.g., meditation, teaching"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#000000] mb-1">
                              YouTube Live ID
                            </label>
                            <input
                              type="text"
                              value={session.youtube_live_id || ''}
                              onChange={(e) =>
                                updateSession(dayIndex, sessionIndex, 'youtube_live_id', e.target.value)
                              }
                              placeholder="YouTube video ID"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-[#000000] mb-1">
                              Teaching ID
                            </label>
                            <input
                              type="text"
                              value={session.teaching_id || ''}
                              onChange={(e) =>
                                updateSession(dayIndex, sessionIndex, 'teaching_id', e.target.value)
                              }
                              placeholder="Teaching UUID (optional)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>

                          <div className="col-span-2 flex gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={session.has_video}
                                onChange={(e) =>
                                  updateSession(dayIndex, sessionIndex, 'has_video', e.target.checked)
                                }
                                className="w-4 h-4 text-[#7D1A13]"
                              />
                              <span className="text-xs">Has Video</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={session.has_audio}
                                onChange={(e) =>
                                  updateSession(dayIndex, sessionIndex, 'has_audio', e.target.checked)
                                }
                                className="w-4 h-4 text-[#7D1A13]"
                              />
                              <span className="text-xs">Has Audio</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Day Button */}
      <Button
        onClick={addDay}
        variant="outline"
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Day
      </Button>
    </div>
  );
}
