"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ChevronLeftIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CodeBracketIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px;">
              <!-- Header -->
              <h1 style="margin: 0 0 20px; font-size: 32px; color: #1a1a1a; font-weight: 700;">
                Welcome to SatyoGam!
              </h1>

              <!-- Content -->
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666666;">
                Dear {{name}},
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666666;">
                Thank you for subscribing to our newsletter. We're excited to share our latest teachings and updates with you.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td style="background-color: #3B82F6; border-radius: 6px; padding: 16px 32px;">
                    <a href="https://satyoga.com/teachings" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; display: block;">
                      Explore Teachings
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <!-- Footer -->
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #999999; text-align: center;">
                You're receiving this email because you subscribed to SatyoGam newsletter.<br>
                <a href="{{unsubscribe_link}}" style="color: #3B82F6; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Sample user data for preview
const SAMPLE_USER_DATA = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  membership_tier: 'Pragyani',
  unsubscribe_link: '#unsubscribe',
};

export default function BeefreeBuilderClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [templateName, setTemplateName] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'code'>('split');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [sampleUser, setSampleUser] = useState<any>(null);
  const [loadingSample, setLoadingSample] = useState(false);

  // Replace template variables with sample data for preview
  const getPreviewHtml = () => {
    let previewHtml = htmlContent;

    // Use fetched sample user if available, otherwise use default
    const userData = sampleUser || SAMPLE_USER_DATA;

    // Replace all template variables
    Object.entries(userData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      previewHtml = previewHtml.replace(regex, value);
    });

    return previewHtml;
  };

  const loadSampleUser = async () => {
    setLoadingSample(true);
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/sample-user`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setSampleUser({
          ...userData,
          unsubscribe_link: '#unsubscribe', // Add unsubscribe link
        });
      } else {
        console.error('Failed to fetch sample user');
        // Fall back to default sample data
        setSampleUser(SAMPLE_USER_DATA);
      }
    } catch (error) {
      console.error('Error loading sample user:', error);
      // Fall back to default sample data
      setSampleUser(SAMPLE_USER_DATA);
    } finally {
      setLoadingSample(false);
    }
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (!subject.trim()) {
      alert('Please enter a subject line');
      return;
    }

    setSaving(true);

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          subject: subject,
          html_content: htmlContent,
        }),
      });

      if (response.ok) {
        alert('Template saved successfully!');
        router.push('/dashboard/admin/email/templates');
      } else {
        const error = await response.json();
        alert(`Failed to save template: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const loadSampleTemplate = () => {
    setHtmlContent(DEFAULT_HTML);
    setTemplateName('Welcome Email');
    setSubject('Welcome to SatyoGam, {{name}}!');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlContent);
    alert('HTML copied to clipboard!');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-[#F3F4F6] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/admin/email/templates')}
              className="text-[#737373] hover:text-[#1F2937]"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <div>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name..."
                className="text-xl font-semibold border-0 border-b-2 border-transparent hover:border-[#E5E7EB] focus:border-[#7D1A13] outline-none px-2 py-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}
              />
              <p className="text-sm text-[#737373] mt-1">Import HTML from Beefree or edit directly</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-2 rounded-lg transition text-sm ${
                  viewMode === 'split'
                    ? 'bg-white text-[#1F2937] shadow-sm font-medium'
                    : 'text-[#737373] hover:text-[#1F2937]'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-2 rounded-lg transition text-sm ${
                  viewMode === 'preview'
                    ? 'bg-white text-[#1F2937] shadow-sm font-medium'
                    : 'text-[#737373] hover:text-[#1F2937]'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-2 rounded-lg transition flex items-center gap-1 text-sm ${
                  viewMode === 'code'
                    ? 'bg-white text-[#1F2937] shadow-sm font-medium'
                    : 'text-[#737373] hover:text-[#1F2937]'
                }`}
              >
                <CodeBracketIcon className="w-4 h-4" />
                Code
              </button>
            </div>

            {viewMode !== 'code' && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                    deviceMode === 'desktop'
                      ? 'bg-white text-[#1F2937] shadow-sm'
                      : 'text-[#737373] hover:text-[#1F2937]'
                  }`}
                >
                  <ComputerDesktopIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                    deviceMode === 'mobile'
                      ? 'bg-white text-[#1F2937] shadow-sm'
                      : 'text-[#737373] hover:text-[#1F2937]'
                  }`}
                >
                  <DevicePhoneMobileIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-gray-200 text-[#374151] rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
              title="Copy HTML to clipboard"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
              Copy
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !templateName || !subject}
              className="px-6 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </div>

      {/* Template Settings Bar */}
      <div className="bg-white border-b border-[#F3F4F6] px-6 py-3">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[#374151] mb-1">
              Subject Line *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email subject (use {{variables}} for personalization)"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">
              Quick Actions
            </label>
            <div className="flex gap-2">
              <button
                onClick={loadSampleTemplate}
                className="px-4 py-2 bg-gray-200 text-[#374151] rounded-lg hover:bg-gray-300 transition flex items-center gap-2 text-sm"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
                Load Template
              </button>
              <button
                onClick={loadSampleUser}
                disabled={loadingSample}
                className="px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <ArrowPathIcon className="w-4 h-4" />
                {loadingSample ? 'Loading...' : 'Load Sample User'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor (Left or Full Width) */}
        {(viewMode === 'split' || viewMode === 'code') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'flex-1'} flex flex-col bg-gray-900`}>
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
              <span className="text-sm text-gray-300 font-medium">HTML Editor</span>
              <span className="text-xs text-[#737373]">Paste HTML from Beefree.io or write your own</span>
            </div>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="flex-1 p-4 bg-gray-900 text-green-400 font-mono text-sm resize-none outline-none"
              spellCheck={false}
              placeholder="Paste your HTML email template here..."
            />
          </div>
        )}

        {/* Preview Panel (Right or Full Width) */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'flex-1'} flex flex-col bg-gray-100`}>
            <div className="bg-white px-4 py-2 border-b border-[#F3F4F6] flex justify-between items-center">
              <span className="text-sm text-[#374151] font-medium">Live Preview</span>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-[#737373]">
                  {sampleUser ? (
                    <>Previewing as: <strong>{sampleUser.name}</strong> ({sampleUser.email})</>
                  ) : (
                    <>Available variables: {'{{name}}'}, {'{{email}}'}, {'{{membership_tier}}'}, {'{{unsubscribe_link}}'}</>
                  )}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-8">
              <div
                className={`mx-auto bg-white shadow-lg transition-all ${
                  deviceMode === 'mobile' ? 'max-w-sm' : 'max-w-3xl'
                }`}
              >
                <iframe
                  srcDoc={getPreviewHtml()}
                  title="Email Preview"
                  className="w-full border-0"
                  style={{ minHeight: '600px', height: '100%' }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="bg-blue-50 border-t border-blue-200 px-6 py-3">
        <p className="text-sm text-blue-800">
          <strong>💡 Pro Tip:</strong> Use{' '}
          <a
            href="https://beefree.io/bee-free/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-900 font-semibold"
          >
            Beefree.io&apos;s free editor
          </a>{' '}
          to design your email visually with drag-and-drop, then export the HTML and paste it into the Code Editor above.
          Variables like {'{{name}}'} and {'{{email}}'} will be replaced automatically when sending campaigns.
        </p>
      </div>
    </div>
  );
}
