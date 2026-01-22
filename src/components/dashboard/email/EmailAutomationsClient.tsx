"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PlusIcon, TrashIcon, PencilIcon, BoltIcon, BoltSlashIcon } from '@heroicons/react/24/outline';

interface Automation {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: {
    event_name: string;
    properties?: Record<string, any>;
  };
  template_id: string;
  delay_minutes: number;
  is_active: boolean;
  created_at: string;
}

interface Template {
  id: string;
  name: string;
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

export default function EmailAutomationsClient() {
  const { data: session } = useSession();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    event_name: '',
    template_id: '',
    delay_minutes: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchAutomations();
    fetchTemplates();
  }, []);

  const fetchAutomations = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/automations`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAutomations(data);
      }
    } catch (error) {
      console.error('Error fetching automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/templates`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      trigger_type: 'mixpanel_event',
      trigger_config: {
        event_name: formData.event_name,
      },
      template_id: formData.template_id,
      delay_minutes: formData.delay_minutes,
      is_active: formData.is_active,
    };

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const url = editingAutomation
        ? `${FASTAPI_URL}/api/email/automations/${editingAutomation.id}`
        : `${FASTAPI_URL}/api/email/automations`;

      const response = await fetch(url, {
        method: editingAutomation ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingAutomation(null);
        setFormData({ name: '', event_name: '', template_id: '', delay_minutes: 0, is_active: true });
        fetchAutomations();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error saving automation:', error);
      alert('Failed to save automation');
    }
  };

  const handleDelete = async (automationId: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) {
      return;
    }

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/automations/${automationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        fetchAutomations();
      }
    } catch (error) {
      console.error('Error deleting automation:', error);
    }
  };

  const toggleActive = async (automation: Automation) => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/automations/${automation.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !automation.is_active }),
      });

      if (response.ok) {
        fetchAutomations();
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
    setFormData({
      name: automation.name,
      event_name: automation.trigger_config.event_name,
      template_id: automation.template_id,
      delay_minutes: automation.delay_minutes,
      is_active: automation.is_active,
    });
    setShowModal(true);
  };

  const formatDelay = (minutes: number) => {
    if (minutes === 0) return 'Immediate';
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`;
    return `${Math.floor(minutes / 1440)} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#737373]">Loading automations...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Email Automations</h1>
          <p className="text-[#737373] mt-1">Trigger emails based on user events</p>
        </div>
        <button
          onClick={() => {
            setEditingAutomation(null);
            setFormData({ name: '', event_name: '', template_id: '', delay_minutes: 0, is_active: true });
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Automation
        </button>
      </div>

      {/* Automations List */}
      {automations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BoltIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-[#737373]">No automations found</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-block mt-4 text-[#7D1A13] hover:text-[#6B1710]"
          >
            Create your first automation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {automations.map((automation) => (
            <div
              key={automation.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                automation.is_active ? 'border-green-500' : 'border-[#E5E7EB]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{automation.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        automation.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-[#1F2937]'
                      }`}
                    >
                      {automation.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-[#737373] mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Trigger:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {automation.trigger_config.event_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Delay:</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        {formatDelay(automation.delay_minutes)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">
                    Created {new Date(automation.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(automation)}
                    className={`p-2 rounded-lg transition ${
                      automation.is_active
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    title={automation.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {automation.is_active ? (
                      <BoltSlashIcon className="w-5 h-5" />
                    ) : (
                      <BoltIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(automation)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(automation.id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingAutomation ? 'Edit Automation' : 'Create Automation'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Automation Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Teaching Watched → Course Recommendation"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Trigger Event
                  </label>
                  <select
                    value={formData.event_name}
                    onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select an event...</option>
                    {COMMON_EVENTS.map((event) => (
                      <option key={event} value={event}>
                        {event}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[#737373] mt-1">
                    This automation will trigger when this event occurs
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Email Template
                  </label>
                  <select
                    value={formData.template_id}
                    onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Delay (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.delay_minutes}
                    onChange={(e) => setFormData({ ...formData, delay_minutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                  <p className="text-xs text-[#737373] mt-1">
                    0 = immediate, 60 = 1 hour, 1440 = 1 day, 10080 = 1 week
                  </p>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-[#7D1A13] rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-[#374151]">
                      Activate immediately
                    </span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition"
                  >
                    {editingAutomation ? 'Update Automation' : 'Create Automation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAutomation(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-[#374151] rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
