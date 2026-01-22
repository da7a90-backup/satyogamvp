"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  template_id: string;
  segment_filter: any;
  scheduled_at: string | null;
  status: string;
}

interface EditCampaignClientProps {
  campaignId: string;
}

export default function EditCampaignClient({ campaignId }: EditCampaignClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    from_name: '',
    from_email: '',
    scheduled_at: '',
  });

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Check if campaign can be edited
        if (data.status === 'sent') {
          alert('Cannot edit a campaign that has already been sent');
          router.push(`/dashboard/admin/email/campaigns/${campaignId}`);
          return;
        }

        setCampaign(data);
        setFormData({
          name: data.name,
          subject: data.subject,
          from_name: data.from_name,
          from_email: data.from_email,
          scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : '',
        });
      } else {
        alert('Failed to load campaign');
        router.push('/dashboard/admin/email');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      alert('Failed to load campaign');
      router.push('/dashboard/admin/email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

      const payload = {
        name: formData.name,
        subject: formData.subject,
        from_name: formData.from_name,
        from_email: formData.from_email,
        scheduled_at: formData.scheduled_at || null,
      };

      const response = await fetch(`${FASTAPI_URL}/api/email/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Campaign updated successfully!');
        router.push(`/dashboard/admin/email/campaigns/${campaignId}`);
      } else {
        const error = await response.json();
        alert(`Failed to update campaign: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#737373]">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#737373]">Campaign not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/dashboard/admin/email/campaigns/${campaignId}`)}
          className="flex items-center text-[#737373] hover:text-[#1F2937] mb-4"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Back to Campaign
        </button>
        <h1 className="text-3xl font-bold text-[#1F2937]">Edit Campaign</h1>
        <p className="text-[#737373] mt-2">Update campaign details</p>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> You can only edit campaigns that haven&apos;t been sent yet.
          Changes to the template or audience are not supported in edit mode.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">
            Campaign Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
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
            required
          />
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

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">
            Scheduled Send Time
          </label>
          <input
            type="datetime-local"
            value={formData.scheduled_at}
            onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="text-xs text-[#737373] mt-1">
            Leave empty to keep as draft or send immediately
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/dashboard/admin/email/campaigns/${campaignId}`)}
            className="flex-1 px-6 py-3 bg-gray-200 text-[#374151] rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
