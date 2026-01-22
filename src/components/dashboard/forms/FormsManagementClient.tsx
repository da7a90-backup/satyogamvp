'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Copy, Eye } from 'lucide-react';

interface FormTemplate {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  is_published: boolean;
  created_at: string;
  section_count: number;
  submission_count: number;
}

export default function FormsManagementClient() {
  const router = useRouter();
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/dynamic-forms/admin/forms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch forms');

      const data = await res.json();
      setForms(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewForm = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/dynamic-forms/admin/forms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: `new-form-${Date.now()}`,
          title: 'New Form',
          subtitle: '',
          description: '',
          is_published: false,
          sections: [],
        }),
      });

      if (!res.ok) throw new Error('Failed to create form');

      const newForm = await res.json();
      router.push(`/dashboard/admin/forms/builder/${newForm.id}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/dynamic-forms/admin/forms/${formId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete form');

      fetchForms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Forms</h1>
            <p className="text-gray-600 mt-2">Create and manage dynamic forms for retreat applications, surveys, and more</p>
          </div>
          <Button onClick={createNewForm} className="bg-black hover:bg-gray-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create New Form
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{form.title}</h3>
                  {form.subtitle && (
                    <p className="text-sm text-gray-600 mb-2">{form.subtitle}</p>
                  )}
                  <p className="text-xs text-gray-500">/{form.slug}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${form.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {form.is_published ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>{form.section_count} sections</span>
                <span>•</span>
                <span>{form.submission_count} submissions</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push(`/dashboard/admin/forms/builder/${form.id}`)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => router.push(`/dashboard/admin/forms/submissions/${form.id}`)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => deleteForm(form.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {forms.length === 0 && !loading && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No forms yet. Create your first form to get started!</p>
            <Button onClick={createNewForm} className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Form
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
