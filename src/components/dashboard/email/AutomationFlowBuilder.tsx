"use client";

import { useState } from 'react';
import {
  BoltIcon,
  ClockIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface FlowNode {
  id: string;
  type: 'trigger' | 'delay' | 'email' | 'condition';
  data: {
    label: string;
    description?: string;
    icon?: any;
  };
}

interface AutomationFlowBuilderProps {
  automationId?: string;
  onSave?: (flow: FlowNode[]) => void;
}

export default function AutomationFlowBuilder({ automationId, onSave }: AutomationFlowBuilderProps) {
  const [nodes, setNodes] = useState<FlowNode[]>([
    {
      id: '1',
      type: 'trigger',
      data: {
        label: 'User Signup',
        description: 'When a user creates an account',
        icon: BoltIcon,
      },
    },
    {
      id: '2',
      type: 'delay',
      data: {
        label: 'Wait 5 minutes',
        description: 'Delay before sending',
        icon: ClockIcon,
      },
    },
    {
      id: '3',
      type: 'email',
      data: {
        label: 'Welcome Email',
        description: 'Send welcome email template',
        icon: EnvelopeIcon,
      },
    },
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const getNodeColor = (type: string) => {
    const colors = {
      trigger: 'bg-blue-100 border-blue-300 text-blue-900',
      delay: 'bg-yellow-100 border-yellow-300 text-yellow-900',
      email: 'bg-green-100 border-green-300 text-green-900',
      condition: 'bg-purple-100 border-purple-300 text-purple-900',
    };
    return colors[type as keyof typeof colors] || colors.trigger;
  };

  const getNodeIcon = (type: string) => {
    const icons = {
      trigger: BoltIcon,
      delay: ClockIcon,
      email: EnvelopeIcon,
      condition: CheckCircleIcon,
    };
    return icons[type as keyof typeof icons] || BoltIcon;
  };

  const addNode = (type: 'delay' | 'email' | 'condition') => {
    const newNode: FlowNode = {
      id: Date.now().toString(),
      type,
      data: {
        label: type === 'delay' ? 'Wait...' : type === 'email' ? 'New Email' : 'Check Condition',
        description: 'Configure this step',
        icon: getNodeIcon(type),
      },
    };

    setNodes([...nodes, newNode]);
  };

  const removeNode = (id: string) => {
    // Don't allow removing the trigger
    if (nodes.find(n => n.id === id)?.type === 'trigger') {
      return;
    }
    setNodes(nodes.filter(n => n.id !== id));
    if (selectedNode === id) {
      setSelectedNode(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Automation Flow</h3>
          <p className="text-sm text-[#737373]">Build your email automation sequence</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => addNode('delay')}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
          >
            <ClockIcon className="w-4 h-4" />
            Add Delay
          </button>
          <button
            onClick={() => addNode('email')}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition"
          >
            <EnvelopeIcon className="w-4 h-4" />
            Add Email
          </button>
          <button
            onClick={() => addNode('condition')}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition"
          >
            <CheckCircleIcon className="w-4 h-4" />
            Add Condition
          </button>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="relative">
        <div className="flex flex-col items-center gap-4">
          {nodes.map((node, index) => {
            const Icon = node.data.icon || getNodeIcon(node.type);
            const isSelected = selectedNode === node.id;

            return (
              <div key={node.id} className="w-full max-w-md">
                {/* Connection Line */}
                {index > 0 && (
                  <div className="flex justify-center mb-4">
                    <div className="w-0.5 h-8 bg-gray-300"></div>
                  </div>
                )}

                {/* Node Card */}
                <div
                  onClick={() => setSelectedNode(node.id)}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    getNodeColor(node.type)
                  } ${
                    isSelected ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-102'
                  }`}
                >
                  {/* Delete Button */}
                  {node.type !== 'trigger' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNode(node.id);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{node.data.label}</h4>
                        <span className="px-2 py-0.5 text-xs bg-white rounded-full">
                          {node.type}
                        </span>
                      </div>
                      <p className="text-sm opacity-75">{node.data.description}</p>
                    </div>
                  </div>

                  {/* Additional Config UI based on type */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                      {node.type === 'delay' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Delay Duration</label>
                          <select className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm">
                            <option>5 minutes</option>
                            <option>15 minutes</option>
                            <option>30 minutes</option>
                            <option>1 hour</option>
                            <option>2 hours</option>
                            <option>1 day</option>
                            <option>3 days</option>
                            <option>1 week</option>
                          </select>
                        </div>
                      )}

                      {node.type === 'email' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Email Template</label>
                          <select className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm">
                            <option>Select template...</option>
                            <option>Welcome Email</option>
                            <option>Follow-up Email</option>
                            <option>Thank You Email</option>
                          </select>
                        </div>
                      )}

                      {node.type === 'condition' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Condition</label>
                          <select className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm mb-2">
                            <option>Email was opened</option>
                            <option>Link was clicked</option>
                            <option>User made purchase</option>
                            <option>Custom event occurred</option>
                          </select>
                          <div className="flex gap-2">
                            <button className="flex-1 px-3 py-2 text-xs bg-green-200 rounded-lg hover:bg-green-300">
                              ✓ If true
                            </button>
                            <button className="flex-1 px-3 py-2 text-xs bg-red-200 rounded-lg hover:bg-red-300">
                              ✗ If false
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add More Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => addNode('email')}
            className="flex items-center gap-2 px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Add Another Step
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 pt-6 border-t border-[#F3F4F6]">
        <div className="flex gap-3">
          <button
            onClick={() => onSave && onSave(nodes)}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Save Automation Flow
          </button>
          <button className="px-6 py-3 bg-gray-200 text-[#374151] rounded-lg hover:bg-gray-300 transition font-medium">
            Preview
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-[#1F2937] mb-3">Node Types:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#7D1A13]"></div>
            <span className="text-[#374151]">Trigger Event</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-[#374151]">Wait/Delay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-[#374151]">Send Email</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#7D1A13]"></div>
            <span className="text-[#374151]">Condition/Branch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
