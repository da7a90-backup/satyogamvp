"use client";

import { useState } from 'react';
import {
  BeakerIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface ABVariant {
  id: string;
  name: string;
  subject: string;
  percentage: number;
  sends: number;
  opens: number;
  clicks: number;
}

interface ABTestingSetupProps {
  campaignId?: string;
  onSave?: (variants: ABVariant[]) => void;
}

export default function ABTestingSetup({ campaignId, onSave }: ABTestingSetupProps) {
  const [testType, setTestType] = useState<'subject' | 'content'>('subject');
  const [variants, setVariants] = useState<ABVariant[]>([
    {
      id: 'A',
      name: 'Variant A',
      subject: '',
      percentage: 50,
      sends: 0,
      opens: 0,
      clicks: 0,
    },
    {
      id: 'B',
      name: 'Variant B',
      subject: '',
      percentage: 50,
      sends: 0,
      opens: 0,
      clicks: 0,
    },
  ]);

  const [testDuration, setTestDuration] = useState(24); // hours
  const [sampleSize, setSampleSize] = useState(20); // percentage

  const addVariant = () => {
    if (variants.length >= 4) {
      alert('Maximum 4 variants allowed');
      return;
    }

    const newPercentage = Math.floor(100 / (variants.length + 1));
    const updatedVariants = variants.map(v => ({
      ...v,
      percentage: newPercentage,
    }));

    updatedVariants.push({
      id: String.fromCharCode(65 + variants.length), // A, B, C, D
      name: `Variant ${String.fromCharCode(65 + variants.length)}`,
      subject: '',
      percentage: newPercentage,
      sends: 0,
      opens: 0,
      clicks: 0,
    });

    setVariants(updatedVariants);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 2) {
      alert('Minimum 2 variants required');
      return;
    }

    const filtered = variants.filter(v => v.id !== id);
    const newPercentage = Math.floor(100 / filtered.length);

    setVariants(filtered.map(v => ({
      ...v,
      percentage: newPercentage,
    })));
  };

  const updateVariant = (id: string, field: string, value: any) => {
    setVariants(variants.map(v =>
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const updatePercentage = (id: string, value: number) => {
    const total = variants.reduce((sum, v) => v.id === id ? sum : sum + v.percentage, 0);
    const remaining = 100 - total;

    if (value > remaining) {
      value = remaining;
    }

    setVariants(variants.map(v =>
      v.id === id ? { ...v, percentage: value } : v
    ));
  };

  const totalPercentage = variants.reduce((sum, v) => sum + v.percentage, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-lg">
          <BeakerIcon className="w-6 h-6 text-[#7D1A13]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>A/B Testing Setup</h3>
          <p className="text-sm text-[#737373]">Test different versions to optimize performance</p>
        </div>
      </div>

      {/* Test Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#374151] mb-3">Test Type</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setTestType('subject')}
            className={`p-4 border-2 rounded-lg transition ${
              testType === 'subject'
                ? 'border-purple-500 bg-purple-50'
                : 'border-[#F3F4F6] hover:border-[#E5E7EB]'
            }`}
          >
            <div className="font-semibold text-[#1F2937] mb-1">Subject Line</div>
            <div className="text-xs text-[#737373]">Test different email subjects</div>
          </button>

          <button
            onClick={() => setTestType('content')}
            className={`p-4 border-2 rounded-lg transition ${
              testType === 'content'
                ? 'border-purple-500 bg-purple-50'
                : 'border-[#F3F4F6] hover:border-[#E5E7EB]'
            }`}
          >
            <div className="font-semibold text-[#1F2937] mb-1">Email Content</div>
            <div className="text-xs text-[#737373]">Test different email templates</div>
          </button>
        </div>
      </div>

      {/* Test Configuration */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">
            Test Duration (hours)
          </label>
          <input
            type="number"
            value={testDuration}
            onChange={(e) => setTestDuration(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            min="1"
            max="168"
          />
          <p className="text-xs text-[#737373] mt-1">How long to run the test before picking winner</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">
            Test Sample Size (%)
          </label>
          <input
            type="number"
            value={sampleSize}
            onChange={(e) => setSampleSize(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            min="10"
            max="100"
          />
          <p className="text-xs text-[#737373] mt-1">Percentage of list to test with</p>
        </div>
      </div>

      {/* Variants */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-medium text-[#374151]">Test Variants</label>
          <button
            onClick={addVariant}
            className="text-sm text-[#7D1A13] hover:text-[#6B1710] font-medium"
            disabled={variants.length >= 4}
          >
            + Add Variant
          </button>
        </div>

        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div key={variant.id} className="p-4 border-2 border-[#F3F4F6] rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#7D1A13] text-white rounded-full flex items-center justify-center font-bold">
                    {variant.id}
                  </div>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                    className="font-medium text-[#1F2937] border-0 border-b border-transparent hover:border-[#E5E7EB] focus:border-purple-500 outline-none px-2 py-1"
                    placeholder="Variant name"
                  />
                </div>

                {variants.length > 2 && (
                  <button
                    onClick={() => removeVariant(variant.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Subject Line Input */}
              <div className="mb-3">
                <label className="block text-xs text-[#737373] mb-1">
                  {testType === 'subject' ? 'Subject Line' : 'Template'}
                </label>
                {testType === 'subject' ? (
                  <input
                    type="text"
                    value={variant.subject}
                    onChange={(e) => updateVariant(variant.id, 'subject', e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="Enter subject line..."
                  />
                ) : (
                  <select className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
                    <option>Select template...</option>
                    <option>Template 1</option>
                    <option>Template 2</option>
                  </select>
                )}
              </div>

              {/* Traffic Split */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-[#737373] whitespace-nowrap">Traffic Split:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={variant.percentage}
                  onChange={(e) => updatePercentage(variant.id, parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-[#7D1A13] w-12 text-right">
                  {variant.percentage}%
                </span>
              </div>

              {/* Stats Preview (if test is running) */}
              {variant.sends > 0 && (
                <div className="mt-3 pt-3 border-t border-[#F3F4F6]">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[#737373]">Sent</div>
                      <div className="font-bold text-[#1F2937]">{variant.sends}</div>
                    </div>
                    <div>
                      <div className="text-[#737373]">Opens</div>
                      <div className="font-bold text-green-600">
                        {variant.opens} ({variant.sends > 0 ? ((variant.opens / variant.sends) * 100).toFixed(1) : 0}%)
                      </div>
                    </div>
                    <div>
                      <div className="text-[#737373]">Clicks</div>
                      <div className="font-bold text-[#7D1A13]">
                        {variant.clicks} ({variant.sends > 0 ? ((variant.clicks / variant.sends) * 100).toFixed(1) : 0}%)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Total Check */}
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
          totalPercentage === 100 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
        }`}>
          {totalPercentage === 100 ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            <XCircleIcon className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">
            Total traffic split: {totalPercentage}%
            {totalPercentage !== 100 && ` (must equal 100%)`}
          </span>
        </div>
      </div>

      {/* Winner Selection */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <ChartBarIcon className="w-5 h-5 text-[#7D1A13] mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Automatic Winner Selection</h4>
            <p className="text-sm text-blue-800 mb-3">
              After {testDuration} hours, the variant with the highest {testType === 'subject' ? 'open rate' : 'click rate'} will be sent to the remaining {100 - sampleSize}% of subscribers.
            </p>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded text-[#7D1A13]" defaultChecked />
              <span className="text-sm text-blue-900">Enable automatic winner selection</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onSave && onSave(variants)}
          disabled={totalPercentage !== 100}
          className="flex-1 px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start A/B Test
        </button>
        <button className="px-6 py-3 bg-gray-200 text-[#374151] rounded-lg hover:bg-gray-300 transition font-medium">
          Save as Draft
        </button>
      </div>
    </div>
  );
}
