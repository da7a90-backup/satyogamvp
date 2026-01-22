'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { getAllCoursesAdmin, deleteCourse } from '@/lib/admin-courses-api';
import { Course } from '@/types/course';
import CourseEditor from './CourseEditor';

export default function CoursesManagementClient() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, [session]);

  const loadCourses = async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const data = await getAllCoursesAdmin(session.accessToken as string);
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!session?.accessToken || deleteConfirm !== courseId) return;

    try {
      await deleteCourse(courseId, session.accessToken as string);
      await loadCourses();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete course:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete course');
    }
  };

  const handleCloseEditor = () => {
    setEditingCourse(null);
    setIsCreating(false);
    loadCourses();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F1]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isCreating || editingCourse) {
    return <CourseEditor course={editingCourse} onClose={handleCloseEditor} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F1] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Courses Management</h1>
            <p className="text-[#414651]">Manage all course selling pages and content</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6a1610] transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create New Course
          </button>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Slug</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Structure</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No courses found. Create your first course to get started.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{course.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{course.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          course.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {course.structure_template || 'None'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/courses/${course.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-[#7D1A13] hover:bg-gray-100 rounded transition"
                          title="View selling page"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setEditingCourse(course)}
                          className="p-2 text-gray-600 hover:text-[#7D1A13] hover:bg-gray-100 rounded transition"
                          title="Edit course"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {deleteConfirm === course.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(course.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
