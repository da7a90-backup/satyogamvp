"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PaperAirplaneIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface Template {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  variables: string[];
}

interface FormData {
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  template_id: string;
  segment_filter: {
    status?: string;
    tags?: string[];
  };
  scheduled_at: string;
}

const STEPS = [
  { id: 1, name: 'Campaign Details', icon: '📝' },
  { id: 2, name: 'Select Template', icon: '📧' },
  { id: 3, name: 'Audience', icon: '👥' },
  { id: 4, name: 'Schedule', icon: '📅' },
  { id: 5, name: 'Review & Send', icon: '🚀' },
];

export default function CreateCampaignClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    subject: '',
    from_name: 'SatyoGam',
    from_email: 'hello@satyoga.com',
    template_id: '',
    segment_filter: {
      status: 'active',
    },
    scheduled_at: '',
  });

  useEffect(() => {
    fetchTemplates();
    fetchSubscriberCount();
  }, []);

  useEffect(() => {
    // Update subscriber count when segment filter changes
    fetchSubscriberCount();
  }, [formData.segment_filter]);

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

  const fetchSubscriberCount = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const params = new URLSearchParams();
      if (formData.segment_filter.status) {
        params.append('status', formData.segment_filter.status);
      }

      const response = await fetch(`${FASTAPI_URL}/api/email/subscribers?${params}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriberCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (sendNow: boolean = false) => {
    setLoading(true);

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

      // Create campaign
      const campaignPayload = {
        name: formData.name,
        template_id: formData.template_id,
        subject: formData.subject,
        from_name: formData.from_name,
        from_email: formData.from_email,
        segment_filter: formData.segment_filter,
        scheduled_at: formData.scheduled_at || null,
      };

      const response = await fetch(`${FASTAPI_URL}/api/email/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignPayload),
      });

      if (response.ok) {
        const campaign = await response.json();

        // If sending now, trigger send immediately
        if (sendNow) {
          const sendResponse = await fetch(`${FASTAPI_URL}/api/email/campaigns/${campaign.id}/send`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.user?.accessToken}`,
            },
          });

          if (sendResponse.ok) {
            alert('Campaign sent successfully!');
            router.push('/dashboard/admin/email');
          } else {
            const error = await sendResponse.json();
            alert(`Failed to send campaign: ${error.detail}`);
          }
        } else {
          alert('Campaign created successfully!');
          router.push('/dashboard/admin/email');
        }
      } else {
        const error = await response.json();
        alert(`Failed to create campaign: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.subject && formData.from_name && formData.from_email;
      case 2:
        return formData.template_id !== '';
      case 3:
        return true; // Audience step is optional
      case 4:
        return true; // Schedule step is optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Monthly Newsletter - January 2024"
                required
              />
              <p className="text-xs text-[#737373] mt-1">Internal name for your reference</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., New Teachings & Retreat Updates"
                required
              />
              <p className="text-xs text-[#737373] mt-1">This will appear in subscribers' inboxes</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  From Name *
                </label>
                <input
                  type="text"
                  value={formData.from_name}
                  onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  From Email *
                </label>
                <input
                  type="email"
                  value={formData.from_email}
                  onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-[#737373]">Select an email template for your campaign</p>

            {templates.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-[#737373]">No templates available</p>
                <button
                  onClick={() => router.push('/dashboard/admin/email/templates')}
                  className="mt-4 text-[#7D1A13] hover:text-[#6B1710]"
                >
                  Create a template first
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      setFormData({ ...formData, template_id: template.id });
                      setSelectedTemplate(template);
                      if (!formData.subject) {
                        setFormData({ ...formData, template_id: template.id, subject: template.subject });
                      }
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.template_id === template.id
                        ? 'border-[#7D1A13] bg-blue-50'
                        : 'border-[#F3F4F6] hover:border-[#E5E7EB]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-[#1F2937]">{template.name}</h4>
                      {formData.template_id === template.id && (
                        <CheckCircleIcon className="w-5 h-5 text-[#7D1A13]" />
                      )}
                    </div>
                    <p className="text-sm text-[#737373] mb-3">{template.subject}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                      }}
                      className="flex items-center text-sm text-[#7D1A13] hover:text-[#6B1710]"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Preview
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserGroupIcon className="w-5 h-5 text-[#7D1A13]" />
                <span className="font-semibold text-blue-900">Estimated Recipients</span>
              </div>
              <p className="text-2xl font-bold text-[#7D1A13]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{subscriberCount} subscribers</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Subscriber Status
              </label>
              <select
                value={formData.segment_filter.status || 'active'}
                onChange={(e) => setFormData({
                  ...formData,
                  segment_filter: { ...formData.segment_filter, status: e.target.value }
                })}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active Subscribers</option>
                <option value="">All Subscribers</option>
              </select>
              <p className="text-xs text-[#737373] mt-1">Choose which subscribers will receive this campaign</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Advanced segmentation (tags, engagement level, custom filters)
                will be available in a future update. Currently sending to all active subscribers.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                When should this campaign be sent?
              </label>

              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-[#F3F4F6] rounded-lg cursor-pointer hover:border-blue-300">
                  <input
                    type="radio"
                    name="sendTime"
                    checked={!formData.scheduled_at}
                    onChange={() => setFormData({ ...formData, scheduled_at: '' })}
                    className="w-4 h-4 text-[#7D1A13]"
                  />
                  <div className="ml-3">
                    <div className="flex items-center gap-2">
                      <PaperAirplaneIcon className="w-5 h-5 text-[#737373]" />
                      <span className="font-medium text-[#1F2937]">Send Immediately</span>
                    </div>
                    <p className="text-sm text-[#737373] mt-1">Campaign will be sent right after review</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-[#F3F4F6] rounded-lg cursor-pointer hover:border-blue-300">
                  <input
                    type="radio"
                    name="sendTime"
                    checked={!!formData.scheduled_at}
                    onChange={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setFormData({
                        ...formData,
                        scheduled_at: tomorrow.toISOString().slice(0, 16)
                      });
                    }}
                    className="w-4 h-4 text-[#7D1A13]"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-[#737373]" />
                      <span className="font-medium text-[#1F2937]">Schedule for Later</span>
                    </div>
                    <p className="text-sm text-[#737373] mt-1">Choose a specific date and time</p>

                    {formData.scheduled_at && (
                      <input
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                        className="mt-3 px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-[#1F2937] mb-4">Campaign Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#737373]">Campaign Name:</span>
                  <span className="font-medium text-[#1F2937]">{formData.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#737373]">Subject:</span>
                  <span className="font-medium text-[#1F2937]">{formData.subject}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#737373]">From:</span>
                  <span className="font-medium text-[#1F2937]">{formData.from_name} &lt;{formData.from_email}&gt;</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#737373]">Template:</span>
                  <span className="font-medium text-[#1F2937]">{selectedTemplate?.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#737373]">Recipients:</span>
                  <span className="font-medium text-[#1F2937]">{subscriberCount} subscribers</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#737373]">Schedule:</span>
                  <span className="font-medium text-[#1F2937]">
                    {formData.scheduled_at
                      ? new Date(formData.scheduled_at).toLocaleString()
                      : 'Send Immediately'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✓ Everything looks good! Review the details above and click
                &quot;{formData.scheduled_at ? 'Schedule Campaign' : 'Send Campaign'}&quot; to proceed.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/admin/email')}
          className="flex items-center text-[#737373] hover:text-[#1F2937] mb-4"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Back to Campaigns
        </button>
        <h1 className="text-3xl font-bold text-[#1F2937]">Create Email Campaign</h1>
        <p className="text-[#737373] mt-2">Send targeted emails to your newsletter subscribers</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition ${
                    currentStep >= step.id
                      ? 'bg-[#7D1A13] text-white'
                      : 'bg-gray-200 text-[#737373]'
                  }`}
                >
                  {currentStep > step.id ? <CheckCircleIcon className="w-6 h-6" /> : step.icon}
                </div>
                <span className={`text-sm text-center ${
                  currentStep >= step.id ? 'text-[#7D1A13] font-medium' : 'text-[#737373]'
                }`}>
                  {step.name}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div className={`h-1 flex-1 mx-2 ${
                  currentStep > step.id ? 'bg-[#7D1A13]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1F2937] mb-6" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
          {STEPS[currentStep - 1].name}
        </h2>
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`flex items-center px-6 py-3 rounded-lg transition ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-[#374151] hover:bg-gray-300'
          }`}
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="flex gap-3">
          {currentStep === STEPS.length ? (
            <>
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading || !isStepValid()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formData.scheduled_at ? 'Schedule Campaign' : 'Save as Draft'}
              </button>

              {!formData.scheduled_at && (
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={loading || !isStepValid()}
                  className="flex items-center px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                  {loading ? 'Sending...' : 'Send Campaign Now'}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Template Preview Modal */}
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
                  className="text-[#737373] hover:text-[#374151] text-2xl"
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
