"use client";

import { useState } from 'react';
import {
  FunnelIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface SegmentRule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SegmentGroup {
  id: string;
  logic: 'AND' | 'OR';
  rules: SegmentRule[];
}

interface AdvancedSegmentationProps {
  onSegmentChange?: (groups: SegmentGroup[]) => void;
  estimatedCount?: number;
}

const FIELD_OPTIONS = [
  { value: 'status', label: 'Subscription Status' },
  { value: 'subscribed_date', label: 'Subscribed Date' },
  { value: 'engagement', label: 'Engagement Level' },
  { value: 'open_rate', label: 'Open Rate' },
  { value: 'click_rate', label: 'Click Rate' },
  { value: 'tags', label: 'Tags' },
  { value: 'last_opened', label: 'Last Email Opened' },
  { value: 'membership_tier', label: 'Membership Tier' },
  { value: 'purchases', label: 'Total Purchases' },
];

const OPERATOR_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
  status: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' },
  ],
  subscribed_date: [
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'between', label: 'between' },
  ],
  engagement: [
    { value: 'is', label: 'is' },
    { value: 'greater_than', label: 'greater than' },
    { value: 'less_than', label: 'less than' },
  ],
  open_rate: [
    { value: 'greater_than', label: 'greater than' },
    { value: 'less_than', label: 'less than' },
    { value: 'between', label: 'between' },
  ],
  click_rate: [
    { value: 'greater_than', label: 'greater than' },
    { value: 'less_than', label: 'less than' },
  ],
  tags: [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
  ],
  last_opened: [
    { value: 'within', label: 'within last' },
    { value: 'not_within', label: 'not within last' },
  ],
  membership_tier: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' },
  ],
  purchases: [
    { value: 'greater_than', label: 'greater than' },
    { value: 'less_than', label: 'less than' },
    { value: 'equals', label: 'equals' },
  ],
};

export default function AdvancedSegmentation({ onSegmentChange, estimatedCount = 0 }: AdvancedSegmentationProps) {
  const [groups, setGroups] = useState<SegmentGroup[]>([
    {
      id: '1',
      logic: 'AND',
      rules: [
        {
          id: '1-1',
          field: 'status',
          operator: 'is',
          value: 'active',
        },
      ],
    },
  ]);

  const addGroup = () => {
    const newGroup: SegmentGroup = {
      id: Date.now().toString(),
      logic: 'AND',
      rules: [{
        id: `${Date.now()}-1`,
        field: 'status',
        operator: 'is',
        value: '',
      }],
    };
    setGroups([...groups, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    if (groups.length === 1) return;
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const addRule = (groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          rules: [
            ...group.rules,
            {
              id: `${groupId}-${Date.now()}`,
              field: 'status',
              operator: 'is',
              value: '',
            },
          ],
        };
      }
      return group;
    }));
  };

  const removeRule = (groupId: string, ruleId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId && group.rules.length > 1) {
        return {
          ...group,
          rules: group.rules.filter(r => r.id !== ruleId),
        };
      }
      return group;
    }));
  };

  const updateRule = (groupId: string, ruleId: string, field: keyof SegmentRule, value: any) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          rules: group.rules.map(rule => {
            if (rule.id === ruleId) {
              const updated = { ...rule, [field]: value };
              // Reset operator when field changes
              if (field === 'field') {
                updated.operator = OPERATOR_OPTIONS[value]?.[0]?.value || 'is';
                updated.value = '';
              }
              return updated;
            }
            return rule;
          }),
        };
      }
      return group;
    }));
  };

  const toggleGroupLogic = (groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          logic: group.logic === 'AND' ? 'OR' : 'AND',
        };
      }
      return group;
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <FunnelIcon className="w-6 h-6 text-[#7D1A13]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Advanced Segmentation</h3>
          <p className="text-sm text-[#737373]">Create complex subscriber segments with multiple conditions</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-[#737373]">
            <UserGroupIcon className="w-5 h-5" />
            <span className="font-semibold text-[#7D1A13]">{estimatedCount}</span> subscribers
          </div>
        </div>
      </div>

      {/* Segment Groups */}
      <div className="space-y-4">
        {groups.map((group, groupIndex) => (
          <div key={group.id} className="border-2 border-[#F3F4F6] rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#374151]">
                  {groupIndex === 0 ? 'Where' : 'And'}
                </span>
                <button
                  onClick={() => toggleGroupLogic(group.id)}
                  className="px-3 py-1 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                  {group.logic}
                </button>
              </div>

              {groups.length > 1 && (
                <button
                  onClick={() => removeGroup(group.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Rules */}
            <div className="space-y-3">
              {group.rules.map((rule, ruleIndex) => (
                <div key={rule.id} className="flex items-center gap-3">
                  {ruleIndex > 0 && (
                    <span className="text-xs font-medium text-[#737373] uppercase w-12">
                      {group.logic}
                    </span>
                  )}

                  {/* Field */}
                  <select
                    value={rule.field}
                    onChange={(e) => updateRule(group.id, rule.id, 'field', e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {FIELD_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  {/* Operator */}
                  <select
                    value={rule.operator}
                    onChange={(e) => updateRule(group.id, rule.id, 'operator', e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {OPERATOR_OPTIONS[rule.field]?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  {/* Value */}
                  {rule.field === 'status' ? (
                    <select
                      value={rule.value}
                      onChange={(e) => updateRule(group.id, rule.id, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="active">Active</option>
                      <option value="unsubscribed">Unsubscribed</option>
                      <option value="bounced">Bounced</option>
                    </select>
                  ) : rule.field === 'membership_tier' ? (
                    <select
                      value={rule.value}
                      onChange={(e) => updateRule(group.id, rule.id, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="FREE">Free</option>
                      <option value="GYANI">Gyani</option>
                      <option value="PRAGYANI">Pragyani</option>
                      <option value="PRAGYANI_PLUS">Pragyani Plus</option>
                    </select>
                  ) : rule.field === 'engagement' ? (
                    <select
                      value={rule.value}
                      onChange={(e) => updateRule(group.id, rule.id, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <input
                      type={rule.field.includes('rate') || rule.field === 'purchases' ? 'number' : 'text'}
                      value={rule.value}
                      onChange={(e) => updateRule(group.id, rule.id, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter value..."
                    />
                  )}

                  {/* Remove Rule */}
                  {group.rules.length > 1 && (
                    <button
                      onClick={() => removeRule(group.id, rule.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Rule */}
            <button
              onClick={() => addRule(group.id)}
              className="mt-3 text-sm text-[#7D1A13] hover:text-[#6B1710] font-medium"
            >
              + Add condition
            </button>
          </div>
        ))}
      </div>

      {/* Add Group */}
      <button
        onClick={addGroup}
        className="mt-4 w-full py-3 border-2 border-dashed border-[#E5E7EB] rounded-lg text-[#737373] hover:border-[#7D1A13] hover:text-[#7D1A13] transition font-medium flex items-center justify-center gap-2"
      >
        <PlusIcon className="w-5 h-5" />
        Add condition group
      </button>

      {/* Segment Preview */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-[#1F2937] mb-2">Segment Preview</h4>
        <div className="text-sm text-[#374151] space-y-1">
          {groups.map((group, groupIndex) => (
            <div key={group.id}>
              <span className="font-medium">{groupIndex === 0 ? 'Subscribers' : 'AND'}</span>
              {' '}
              {group.rules.map((rule, ruleIndex) => (
                <span key={rule.id}>
                  {ruleIndex > 0 && <span className="text-[#7D1A13]"> {group.logic} </span>}
                  <span className="text-[#7D1A13]">{FIELD_OPTIONS.find(f => f.value === rule.field)?.label}</span>
                  {' '}
                  <span className="text-[#737373]">{OPERATOR_OPTIONS[rule.field]?.find(o => o.value === rule.operator)?.label}</span>
                  {' '}
                  <span className="font-medium">{rule.value || '___'}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Save Segment */}
      <div className="mt-6 flex gap-3">
        <button className="flex-1 px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition font-medium">
          Apply Segment
        </button>
        <button className="px-6 py-3 bg-gray-200 text-[#374151] rounded-lg hover:bg-gray-300 transition font-medium">
          Save as Preset
        </button>
      </div>
    </div>
  );
}
