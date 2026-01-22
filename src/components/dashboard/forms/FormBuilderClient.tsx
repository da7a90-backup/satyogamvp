'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Save, Eye, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  field_type: 'text' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | 'date' | 'phone' | 'number';
  required: boolean;
  options?: string[];
  placeholder?: string;
  help_text?: string;
  validation?: any;
  order: number;
}

interface FormTemplate {
  id?: string;
  name: string;
  slug: string;
  description: string;
  form_type: 'onsite_retreat_application' | 'online_retreat_application' | 'general' | 'contact';
  fields: FormField[];
  is_active: boolean;
  requires_authentication: boolean;
  auto_create_user: boolean;
  linked_retreat_id?: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'file', label: 'File Upload' },
  { value: 'date', label: 'Date' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'number', label: 'Number' },
];

export default function FormBuilderClient({ formId }: { formId: string }) {
  const router = useRouter();
  const [formTemplate, setFormTemplate] = useState<FormTemplate>({
    name: '',
    slug: '',
    description: '',
    form_type: 'onsite_retreat_application',
    fields: [],
    is_active: true,
    requires_authentication: false,
    auto_create_user: true,
  });
  const [loading, setLoading] = useState(formId !== 'new');
  const [saving, setSaving] = useState(false);
  const [retreats, setRetreats] = useState<any[]>([]);

  useEffect(() => {
    if (formId !== 'new') {
      fetchForm();
    }
    fetchRetreats();
  }, [formId]);

  const fetchForm = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/admin/forms/${formId}`);
      if (response.ok) {
        const data = await response.json();
        setFormTemplate(data);
      }
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRetreats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/retreats`);
      if (response.ok) {
        const data = await response.json();
        setRetreats(data);
      }
    } catch (error) {
      console.error('Error fetching retreats:', error);
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      field_type: 'text',
      required: false,
      order: formTemplate.fields.length,
    };
    setFormTemplate({ ...formTemplate, fields: [...formTemplate.fields, newField] });
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...formTemplate.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormTemplate({ ...formTemplate, fields: newFields });
  };

  const deleteField = (index: number) => {
    const newFields = formTemplate.fields.filter((_, i) => i !== index);
    setFormTemplate({ ...formTemplate, fields: newFields });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === formTemplate.fields.length - 1)) {
      return;
    }
    const newFields = [...formTemplate.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    newFields.forEach((field, i) => field.order = i);
    setFormTemplate({ ...formTemplate, fields: newFields });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = formId === 'new' ? 'POST' : 'PUT';
      const url = formId === 'new'
        ? `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/admin/forms`
        : `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/admin/forms/${formId}`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formTemplate),
      });

      if (response.ok) {
        alert('Form saved successfully!');
        router.push('/dashboard/admin/forms');
      } else {
        alert('Failed to save form');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {formId === 'new' ? 'Create Form' : 'Edit Form'}
              </h1>
              <p className="text-gray-600">Build and configure your form fields</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/dashboard/admin/forms')}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Form'}
              </Button>
            </div>
          </div>

          {/* Form Settings */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
              <input
                type="text"
                value={formTemplate.name}
                onChange={(e) => setFormTemplate({ ...formTemplate, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Shakti Retreat Application"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                value={formTemplate.slug}
                onChange={(e) => setFormTemplate({ ...formTemplate, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="shakti-application"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formTemplate.description}
                onChange={(e) => setFormTemplate({ ...formTemplate, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Application form for the Shakti retreat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Form Type</label>
              <select
                value={formTemplate.form_type}
                onChange={(e) => setFormTemplate({ ...formTemplate, form_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="onsite_retreat_application">Onsite Retreat Application</option>
                <option value="online_retreat_application">Online Retreat Application</option>
                <option value="general">General Form</option>
                <option value="contact">Contact Form</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Linked Retreat</label>
              <select
                value={formTemplate.linked_retreat_id || ''}
                onChange={(e) => setFormTemplate({ ...formTemplate, linked_retreat_id: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {retreats.map((retreat) => (
                  <option key={retreat.id} value={retreat.id}>{retreat.title}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formTemplate.is_active}
                  onChange={(e) => setFormTemplate({ ...formTemplate, is_active: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formTemplate.requires_authentication}
                  onChange={(e) => setFormTemplate({ ...formTemplate, requires_authentication: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Requires Login</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formTemplate.auto_create_user}
                  onChange={(e) => setFormTemplate({ ...formTemplate, auto_create_user: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Auto-create User Account</span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Form Fields</h2>
            <Button onClick={addField}>
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>

          {formTemplate.fields.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No fields yet. Click "Add Field" to create your first field.
            </div>
          ) : (
            <div className="space-y-4">
              {formTemplate.fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => moveField(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <button
                        onClick={() => moveField(index, 'down')}
                        disabled={index === formTemplate.fields.length - 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                        <select
                          value={field.field_type}
                          onChange={(e) => updateField(index, { field_type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(index, { placeholder: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Help Text</label>
                        <input
                          type="text"
                          value={field.help_text || ''}
                          onChange={(e) => updateField(index, { help_text: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      {(field.field_type === 'select' || field.field_type === 'radio' || field.field_type === 'checkbox') && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Options (one per line)</label>
                          <textarea
                            value={(field.options || []).join('\n')}
                            onChange={(e) => updateField(index, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            rows={3}
                          />
                        </div>
                      )}
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Required Field</span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteField(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded mt-8"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
