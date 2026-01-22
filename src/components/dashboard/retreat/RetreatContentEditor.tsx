'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { X, Plus, Trash2, Save, ChevronUp, ChevronDown } from 'lucide-react';

interface IncludedItem {
  title: string;
  description: string;
}

interface ScheduleItem {
  time: string;
  activity: string;
}

interface RetreatContent {
  included_title?: string;
  included_items?: IncludedItem[];
  intro1_title?: string;
  intro1_content?: string[];
  schedule_tagline?: string;
  schedule_title?: string;
  schedule_items?: ScheduleItem[];
}

interface RetreatContentEditorProps {
  retreatId: string;
  retreatTitle: string;
  onClose: () => void;
}

export default function RetreatContentEditor({ retreatId, retreatTitle, onClose }: RetreatContentEditorProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<RetreatContent>({
    included_title: '',
    included_items: [],
    intro1_title: '',
    intro1_content: [],
    schedule_tagline: '',
    schedule_title: '',
    schedule_items: []
  });

  useEffect(() => {
    loadContent();
  }, [retreatId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/retreats/${retreatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContent({
          included_title: data.included_title || '',
          included_items: data.included_items || [],
          intro1_title: data.intro1_title || '',
          intro1_content: data.intro1_content || [],
          schedule_tagline: data.schedule_tagline || '',
          schedule_title: data.schedule_title || '',
          schedule_items: data.schedule_items || []
        });
      }
    } catch (error) {
      console.error('Failed to load retreat content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/admin/retreats/${retreatId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(content),
        }
      );

      if (response.ok) {
        alert('Content saved successfully!');
        onClose();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to save content');
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  // Included Items Functions
  const addIncludedItem = () => {
    setContent({
      ...content,
      included_items: [...(content.included_items || []), { title: '', description: '' }]
    });
  };

  const updateIncludedItem = (index: number, field: 'title' | 'description', value: string) => {
    const items = [...(content.included_items || [])];
    items[index][field] = value;
    setContent({ ...content, included_items: items });
  };

  const deleteIncludedItem = (index: number) => {
    const items = [...(content.included_items || [])];
    items.splice(index, 1);
    setContent({ ...content, included_items: items });
  };

  const moveIncludedItem = (index: number, direction: 'up' | 'down') => {
    const items = [...(content.included_items || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < items.length) {
      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      setContent({ ...content, included_items: items });
    }
  };

  // Intro Content Functions
  const addIntroParagraph = () => {
    setContent({
      ...content,
      intro1_content: [...(content.intro1_content || []), '']
    });
  };

  const updateIntroParagraph = (index: number, value: string) => {
    const paragraphs = [...(content.intro1_content || [])];
    paragraphs[index] = value;
    setContent({ ...content, intro1_content: paragraphs });
  };

  const deleteIntroParagraph = (index: number) => {
    const paragraphs = [...(content.intro1_content || [])];
    paragraphs.splice(index, 1);
    setContent({ ...content, intro1_content: paragraphs });
  };

  // Schedule Items Functions
  const addScheduleItem = () => {
    setContent({
      ...content,
      schedule_items: [...(content.schedule_items || []), { time: '', activity: '' }]
    });
  };

  const updateScheduleItem = (index: number, field: 'time' | 'activity', value: string) => {
    const items = [...(content.schedule_items || [])];
    items[index][field] = value;
    setContent({ ...content, schedule_items: items });
  };

  const deleteScheduleItem = (index: number) => {
    const items = [...(content.schedule_items || [])];
    items.splice(index, 1);
    setContent({ ...content, schedule_items: items });
  };

  const moveScheduleItem = (index: number, direction: 'up' | 'down') => {
    const items = [...(content.schedule_items || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < items.length) {
      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      setContent({ ...content, schedule_items: items });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
                Edit Retreat Content
              </h2>
              <p className="text-[#717680] mt-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                {retreatTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Included Items Section */}
            <div>
              <h3 className="text-xl font-bold text-[#000000] mb-4" style={{ fontFamily: 'Optima, serif' }}>
                Included Items Section
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={content.included_title || ''}
                  onChange={(e) => setContent({ ...content, included_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  placeholder="e.g., Included in this 7-day retreat"
                />
              </div>

              <div className="space-y-4">
                {(content.included_items || []).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-[#717680]">
                        Item {index + 1}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveIncludedItem(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveIncludedItem(index, 'down')}
                          disabled={index === (content.included_items?.length || 0) - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteIncludedItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateIncludedItem(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                      placeholder="Title"
                    />
                    <textarea
                      value={item.description}
                      onChange={(e) => updateIncludedItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                      placeholder="Description"
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={addIncludedItem}
                variant="outline"
                className="mt-4 w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Included Item
              </Button>
            </div>

            {/* Intro Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-[#000000] mb-4" style={{ fontFamily: 'Optima, serif' }}>
                Introduction Section
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={content.intro1_title || ''}
                  onChange={(e) => setContent({ ...content, intro1_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  placeholder="e.g., A Personal Encounter with Shunyamurti"
                />
              </div>

              <div className="space-y-4">
                {(content.intro1_content || []).map((paragraph, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-[#717680]">
                        Paragraph {index + 1}
                      </span>
                      <button
                        onClick={() => deleteIntroParagraph(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={paragraph}
                      onChange={(e) => updateIntroParagraph(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={4}
                      placeholder="Paragraph content"
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={addIntroParagraph}
                variant="outline"
                className="mt-4 w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Paragraph
              </Button>
            </div>

            {/* Schedule Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-[#000000] mb-4" style={{ fontFamily: 'Optima, serif' }}>
                Schedule Section
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Schedule Tagline
                </label>
                <input
                  type="text"
                  value={content.schedule_tagline || ''}
                  onChange={(e) => setContent({ ...content, schedule_tagline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  placeholder="e.g., A TYPICAL ASHRAM DAY"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Schedule Title
                </label>
                <input
                  type="text"
                  value={content.schedule_title || ''}
                  onChange={(e) => setContent({ ...content, schedule_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  placeholder="e.g., Sample Daily Schedule"
                />
              </div>

              <div className="space-y-4">
                {(content.schedule_items || []).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-[#717680]">
                        Schedule Item {index + 1}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveScheduleItem(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveScheduleItem(index, 'down')}
                          disabled={index === (content.schedule_items?.length || 0) - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteScheduleItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Time (e.g., 4:00 - 4:45am)"
                      />
                      <input
                        type="text"
                        value={item.activity}
                        onChange={(e) => updateScheduleItem(index, 'activity', e.target.value)}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Activity"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={addScheduleItem}
                variant="outline"
                className="mt-4 w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule Item
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
