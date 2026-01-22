"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PlusIcon, TrashIcon, PencilIcon, EyeIcon, PaperAirplaneIcon, SwatchIcon } from '@heroicons/react/24/outline';

interface Template {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export default function EmailTemplatesClient() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_content: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const url = editingTemplate
        ? `${FASTAPI_URL}/api/email/templates/${editingTemplate.id}`
        : `${FASTAPI_URL}/api/email/templates`;

      const response = await fetch(url, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingTemplate(null);
        setFormData({ name: '', subject: '', html_content: '' });
        fetchTemplates();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
    });
    setShowModal(true);
  };

  const sendTestEmail = async (templateId: string) => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/templates/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
          to_email: testEmail,
          variables: {
            name: 'Test User',
            email: testEmail,
          },
        }),
      });

      if (response.ok) {
        alert('Test email sent successfully!');
        setTestEmail('');
      } else {
        const error = await response.json();
        alert(`Failed to send test email: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Failed to send test email');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#737373]">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Email Templates</h1>
          <p className="text-[#737373] mt-1">Create and manage email templates with variables</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/dashboard/admin/email/templates/builder'}
            className="flex items-center px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition"
          >
            <SwatchIcon className="w-5 h-5 mr-2" />
            Visual Builder
          </button>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setFormData({ name: '', subject: '', html_content: '' });
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-[#737373]">No templates found</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-block mt-4 text-[#7D1A13] hover:text-[#6B1710]"
          >
            Create your first template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{template.name}</h3>
                <p className="text-sm text-[#737373] mt-1">{template.subject}</p>
              </div>

              {/* Variables */}
              {template.variables.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[#737373] mb-2">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <span
                        key={variable}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded"
                      >
                        {`{{${variable}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Email */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => sendTestEmail(template.id)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    title="Send test email"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-[#374151] rounded-lg hover:bg-gray-200 transition"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Preview
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Updated {new Date(template.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Use {{name}}, {{email}}, etc. for variables"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    HTML Content
                  </label>
                  <textarea
                    value={formData.html_content}
                    onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    rows={15}
                    placeholder="<h1>Hi {{name}}</h1><p>Your content here...</p>"
                    required
                  />
                  <p className="text-xs text-[#737373] mt-1">
                    Use {'{{variable}}'} syntax. Common variables: name, email, membership_tier
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition"
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTemplate(null);
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

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{previewTemplate.name}</h2>
                  <p className="text-[#737373]">Subject: {previewTemplate.subject}</p>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-[#737373] hover:text-[#374151]"
                >
                  ✕
                </button>
              </div>

              <div className="border border-[#E5E7EB] rounded-lg p-6 bg-gray-50">
                <div dangerouslySetInnerHTML={{ __html: previewTemplate.html_content }} />
              </div>

              <button
                onClick={() => setPreviewTemplate(null)}
                className="mt-4 w-full px-4 py-2 bg-gray-200 text-[#374151] rounded-lg hover:bg-gray-300 transition"
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
