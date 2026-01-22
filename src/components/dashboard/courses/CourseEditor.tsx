'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, Save, Plus, Trash2, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { createCourse, updateCourse, getAllInstructors } from '@/lib/admin-courses-api';
import { Course, CourseStructure, SellingPageData, WhatYouWillLearnItem, CourseIncludesItem, SyllabusLesson, Testimonial, FAQItem, CourseInstructor } from '@/types/course';

interface CourseEditorProps {
  course: Course | null;
  onClose: () => void;
}

type TabKey = 'basic' | 'video' | 'learn' | 'includes' | 'gallery' | 'instructors' | 'syllabus' | 'testimonials' | 'quote';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'basic', label: 'Basic Info' },
  { key: 'video', label: 'Video Intro' },
  { key: 'learn', label: "What You'll Learn" },
  { key: 'includes', label: 'Course Includes' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'instructors', label: 'Instructors' },
  { key: 'syllabus', label: 'Syllabus' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'quote', label: 'Featured Quote' },
];

export default function CourseEditor({ course, onClose }: CourseEditorProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instructorsList, setInstructorsList] = useState<Array<{ id: string; name: string }>>([]);

  // Basic Info
  const [title, setTitle] = useState(course?.title || '');
  const [slug, setSlug] = useState(course?.slug || '');
  const [description, setDescription] = useState(course?.description || '');
  const [price, setPrice] = useState(course?.price || 0);
  const [instructorId, setInstructorId] = useState(course?.instructor?.id || '');
  const [structureTemplate, setStructureTemplate] = useState<CourseStructure | undefined>(course?.structure_template);
  const [isPublished, setIsPublished] = useState(course?.is_published || false);
  const [heroImageUrl, setHeroImageUrl] = useState(course?.selling_page_data?.hero_image_url || '');
  const [heroCloudflareId, setHeroCloudflareId] = useState(course?.selling_page_data?.hero_cloudflare_image_id || '');
  const [shortDescription, setShortDescription] = useState(course?.selling_page_data?.short_description || '');

  // Video Intro
  const [introVideoUid, setIntroVideoUid] = useState(course?.selling_page_data?.intro_video_cloudflare_uid || '');
  const [introVideoTitle, setIntroVideoTitle] = useState(course?.selling_page_data?.intro_video_title || '');
  const [introVideoDescription, setIntroVideoDescription] = useState(course?.selling_page_data?.intro_video_description || '');
  const [totalDuration, setTotalDuration] = useState(course?.selling_page_data?.total_duration || '');
  const [totalLectures, setTotalLectures] = useState(course?.selling_page_data?.total_lectures || 0);

  // What You'll Learn
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<WhatYouWillLearnItem[]>(
    course?.selling_page_data?.what_you_will_learn || []
  );

  // Course Includes
  const [courseIncludes, setCourseIncludes] = useState<CourseIncludesItem[]>(
    course?.selling_page_data?.course_includes || []
  );

  // Gallery
  const [galleryImages, setGalleryImages] = useState<Array<{ url?: string; cloudflare_image_id?: string; alt?: string }>>(
    course?.selling_page_data?.gallery_images || []
  );

  // Instructors
  const [courseInstructors, setCourseInstructors] = useState<CourseInstructor[]>(
    course?.selling_page_data?.instructors || []
  );

  // Syllabus
  const [syllabus, setSyllabus] = useState<SyllabusLesson[]>(
    course?.selling_page_data?.syllabus || []
  );

  // Testimonials
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    course?.selling_page_data?.testimonials || []
  );

  // Featured Quote
  const [featuredQuote, setFeaturedQuote] = useState(course?.selling_page_data?.featured_quote || { text: '', author: '', author_role: '' });

  // FAQ
  const [faq, setFaq] = useState<FAQItem[]>(course?.selling_page_data?.faq || []);

  useEffect(() => {
    if (session?.accessToken) {
      loadInstructors();
    }
  }, [session]);

  const loadInstructors = async () => {
    try {
      const data = await getAllInstructors(session?.accessToken as string);
      setInstructorsList(data);
    } catch (err) {
      console.error('Failed to load instructors:', err);
    }
  };

  const handleSave = async () => {
    if (!session?.accessToken) return;

    try {
      setSaving(true);
      setError(null);

      const sellingPageData: SellingPageData = {
        hero_image_url: heroImageUrl,
        hero_cloudflare_image_id: heroCloudflareId,
        short_description: shortDescription,
        intro_video_cloudflare_uid: introVideoUid,
        intro_video_title: introVideoTitle,
        intro_video_description: introVideoDescription,
        total_duration: totalDuration,
        total_lectures: totalLectures,
        what_you_will_learn: whatYouWillLearn,
        course_includes: courseIncludes,
        gallery_images: galleryImages,
        featured_quote: featuredQuote,
        instructors: courseInstructors,
        syllabus: syllabus,
        testimonials: testimonials,
        faq: faq,
      };

      const payload = {
        slug,
        title,
        description,
        price,
        instructor_id: instructorId || undefined,
        structure_template: structureTemplate,
        is_published: isPublished,
        selling_page_data: sellingPageData,
      };

      if (course) {
        await updateCourse(course.id, payload, session.accessToken as string);
      } else {
        await createCourse(payload, session.accessToken as string);
      }

      onClose();
    } catch (err) {
      console.error('Failed to save course:', err);
      setError(err instanceof Error ? err.message : 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Course Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="e.g., Principles & Practice of Sat Yoga"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent font-mono text-sm"
            placeholder="e.g., principles-practice"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          placeholder="Course description..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Short Description (Hero Section)</label>
        <textarea
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          placeholder="Brief description for the hero section..."
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Price (USD)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Instructor</label>
          <select
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          >
            <option value="">Select an instructor</option>
            {instructorsList.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Structure Template</label>
          <select
            value={structureTemplate || ''}
            onChange={(e) => setStructureTemplate(e.target.value as CourseStructure || undefined)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          >
            <option value="">None</option>
            <option value={CourseStructure.PRINCIPLES_PRACTICE}>Principles & Practice</option>
            <option value={CourseStructure.FUNDAMENTALS_MEDITATION}>Fundamentals of Meditation</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-5 h-5 text-[#7D1A13] border-gray-300 rounded focus:ring-[#7D1A13]"
            />
            <span className="text-sm font-semibold text-gray-900">Published</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Hero Image URL</label>
        <input
          type="text"
          value={heroImageUrl}
          onChange={(e) => setHeroImageUrl(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Hero Cloudflare Image ID</label>
        <input
          type="text"
          value={heroCloudflareId}
          onChange={(e) => setHeroCloudflareId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent font-mono text-sm"
          placeholder="cloudflare-image-id"
        />
      </div>
    </div>
  );

  const renderVideoIntro = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Cloudflare Stream UID</label>
        <input
          type="text"
          value={introVideoUid}
          onChange={(e) => setIntroVideoUid(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent font-mono text-sm"
          placeholder="cloudflare-stream-uid"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Video Title</label>
        <input
          type="text"
          value={introVideoTitle}
          onChange={(e) => setIntroVideoTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          placeholder="e.g., Course Introduction"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Video Description</label>
        <textarea
          value={introVideoDescription}
          onChange={(e) => setIntroVideoDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          placeholder="Description of the intro video..."
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Total Duration</label>
          <input
            type="text"
            value={totalDuration}
            onChange={(e) => setTotalDuration(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="e.g., 10 hours"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Total Lectures</label>
          <input
            type="number"
            value={totalLectures}
            onChange={(e) => setTotalLectures(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="0"
            min="0"
          />
        </div>
      </div>
    </div>
  );

  const renderWhatYouLearn = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Learning Objectives</h3>
        <button
          onClick={() => setWhatYouWillLearn([...whatYouWillLearn, { title: '', description: '', is_expandable: false }])}
          className="flex items-center gap-2 px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6a1610] transition"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {whatYouWillLearn.map((item, index) => (
        <div key={index} className="p-4 border border-gray-300 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Item {index + 1}</span>
            <button
              onClick={() => setWhatYouWillLearn(whatYouWillLearn.filter((_, i) => i !== index))}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={item.title}
            onChange={(e) => {
              const updated = [...whatYouWillLearn];
              updated[index].title = e.target.value;
              setWhatYouWillLearn(updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Title"
          />
          <textarea
            value={item.description}
            onChange={(e) => {
              const updated = [...whatYouWillLearn];
              updated[index].description = e.target.value;
              setWhatYouWillLearn(updated);
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Description"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={item.is_expandable || false}
              onChange={(e) => {
                const updated = [...whatYouWillLearn];
                updated[index].is_expandable = e.target.checked;
                setWhatYouWillLearn(updated);
              }}
              className="w-4 h-4 text-[#7D1A13] border-gray-300 rounded focus:ring-[#7D1A13]"
            />
            <span className="text-sm text-gray-700">Expandable</span>
          </label>
        </div>
      ))}

      {whatYouWillLearn.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No learning objectives added yet. Click "Add Item" to get started.
        </div>
      )}
    </div>
  );

  const renderCourseIncludes = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Course Features</h3>
        <button
          onClick={() => setCourseIncludes([...courseIncludes, { icon: '', title: '', description: '' }])}
          className="flex items-center gap-2 px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6a1610] transition"
        >
          <Plus className="w-4 h-4" />
          Add Feature
        </button>
      </div>

      {courseIncludes.map((item, index) => (
        <div key={index} className="p-4 border border-gray-300 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Feature {index + 1}</span>
            <button
              onClick={() => setCourseIncludes(courseIncludes.filter((_, i) => i !== index))}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={item.icon}
            onChange={(e) => {
              const updated = [...courseIncludes];
              updated[index].icon = e.target.value;
              setCourseIncludes(updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Icon name (optional)"
          />
          <input
            type="text"
            value={item.title}
            onChange={(e) => {
              const updated = [...courseIncludes];
              updated[index].title = e.target.value;
              setCourseIncludes(updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Title"
          />
          <textarea
            value={item.description}
            onChange={(e) => {
              const updated = [...courseIncludes];
              updated[index].description = e.target.value;
              setCourseIncludes(updated);
            }}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Description (optional)"
          />
        </div>
      ))}

      {courseIncludes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No features added yet. Click "Add Feature" to get started.
        </div>
      )}
    </div>
  );

  const renderGallery = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gallery Images</h3>
        <button
          onClick={() => setGalleryImages([...galleryImages, { url: '', cloudflare_image_id: '', alt: '' }])}
          className="flex items-center gap-2 px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6a1610] transition"
        >
          <Plus className="w-4 h-4" />
          Add Image
        </button>
      </div>

      {galleryImages.map((image, index) => (
        <div key={index} className="p-4 border border-gray-300 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Image {index + 1}</span>
            <button
              onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={image.url}
            onChange={(e) => {
              const updated = [...galleryImages];
              updated[index].url = e.target.value;
              setGalleryImages(updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Image URL"
          />
          <input
            type="text"
            value={image.cloudflare_image_id}
            onChange={(e) => {
              const updated = [...galleryImages];
              updated[index].cloudflare_image_id = e.target.value;
              setGalleryImages(updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent font-mono text-sm"
            placeholder="Cloudflare Image ID"
          />
          <input
            type="text"
            value={image.alt}
            onChange={(e) => {
              const updated = [...galleryImages];
              updated[index].alt = e.target.value;
              setGalleryImages(updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Alt text"
          />
        </div>
      ))}

      {galleryImages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No gallery images added yet. Click "Add Image" to get started.
        </div>
      )}
    </div>
  );

  const renderInstructors = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Course Instructors</h3>
        <button
          onClick={() => setCourseInstructors([...courseInstructors, { name: '', bio: '', photo_url: '' }])}
          className="flex items-center gap-2 px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6a1610] transition"
        >
          <Plus className="w-4 h-4" />
          Add Instructor
        </button>
      </div>

      {courseInstructors.map((instructor, index) => (
        <div key={index} className="p-4 border border-gray-300 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Instructor {index + 1}</span>
            <button
              onClick={() => setCourseInstructors(courseInstructors.filter((_, i) => i !== index))}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={instructor.name}
            onChange={(e) => {
              const updated = [...courseInstructors];
              updated[index].name = e.target.value;
              setCourseInstructors(updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Instructor Name"
          />
          <textarea
            value={instructor.bio}
            onChange={(e) => {
              const updated = [...courseInstructors];
              updated[index].bio = e.target.value;
              setCourseInstructors(updated);
            }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Bio"
          />
          <input
            type="text"
            value={instructor.photo_url}
            onChange={(e) => {
              const updated = [...courseInstructors];
              updated[index].photo_url = e.target.value;
              setCourseInstructors(updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Photo URL"
          />
        </div>
      ))}

      {courseInstructors.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No instructors added yet. Click "Add Instructor" to get started.
        </div>
      )}
    </div>
  );

  const renderSyllabus = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Course Syllabus</h3>
        <button
          onClick={() => setSyllabus([...syllabus, { lesson_number: syllabus.length + 1, title: '', duration: '', lectures_count: 0, lesson_items: [], additional_materials: [] }])}
          className="flex items-center gap-2 px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6a1610] transition"
        >
          <Plus className="w-4 h-4" />
          Add Lesson
        </button>
      </div>

      {syllabus.map((lesson, index) => (
        <div key={index} className="p-4 border border-gray-300 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Lesson {index + 1}</span>
            <button
              onClick={() => setSyllabus(syllabus.filter((_, i) => i !== index))}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              value={lesson.lesson_number}
              onChange={(e) => {
                const updated = [...syllabus];
                updated[index].lesson_number = Number(e.target.value);
                setSyllabus(updated);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              placeholder="Lesson #"
            />
            <input
              type="text"
              value={lesson.duration}
              onChange={(e) => {
                const updated = [...syllabus];
                updated[index].duration = e.target.value;
                setSyllabus(updated);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              placeholder="Duration"
            />
            <input
              type="number"
              value={lesson.lectures_count}
              onChange={(e) => {
                const updated = [...syllabus];
                updated[index].lectures_count = Number(e.target.value);
                setSyllabus(updated);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              placeholder="Lectures"
            />
          </div>
          <input
            type="text"
            value={lesson.title}
            onChange={(e) => {
              const updated = [...syllabus];
              updated[index].title = e.target.value;
              setSyllabus(updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Lesson Title"
          />
          <textarea
            value={lesson.lesson_items.join('\n')}
            onChange={(e) => {
              const updated = [...syllabus];
              updated[index].lesson_items = e.target.value.split('\n').filter(item => item.trim());
              setSyllabus(updated);
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Lesson items (one per line)"
          />
        </div>
      ))}

      {syllabus.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No syllabus lessons added yet. Click "Add Lesson" to get started.
        </div>
      )}
    </div>
  );

  const renderTestimonials = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Student Testimonials</h3>
        <button
          onClick={() => setTestimonials([...testimonials, { name: '', role: '', text: '', avatar_url: '' }])}
          className="flex items-center gap-2 px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6a1610] transition"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {testimonials.map((testimonial, index) => (
        <div key={index} className="p-4 border border-gray-300 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Testimonial {index + 1}</span>
            <button
              onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={testimonial.name}
            onChange={(e) => {
              const updated = [...testimonials];
              updated[index].name = e.target.value;
              setTestimonials(updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Student Name"
          />
          <input
            type="text"
            value={testimonial.role}
            onChange={(e) => {
              const updated = [...testimonials];
              updated[index].role = e.target.value;
              setTestimonials(updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Role (optional)"
          />
          <textarea
            value={testimonial.text}
            onChange={(e) => {
              const updated = [...testimonials];
              updated[index].text = e.target.value;
              setTestimonials(updated);
            }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Testimonial text"
          />
          <input
            type="text"
            value={testimonial.avatar_url}
            onChange={(e) => {
              const updated = [...testimonials];
              updated[index].avatar_url = e.target.value;
              setTestimonials(updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Avatar URL (optional)"
          />
        </div>
      ))}

      {testimonials.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No testimonials added yet. Click "Add Testimonial" to get started.
        </div>
      )}
    </div>
  );

  const renderFeaturedQuote = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Featured Quote Section</h3>
      <p className="text-sm text-gray-600">Optional quote section displayed between gallery and instructors</p>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Quote Text</label>
        <textarea
          value={featuredQuote.text}
          onChange={(e) => setFeaturedQuote({ ...featuredQuote, text: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          placeholder="Enter inspirational quote..."
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Author</label>
          <input
            type="text"
            value={featuredQuote.author}
            onChange={(e) => setFeaturedQuote({ ...featuredQuote, author: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="Author name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Author Role</label>
          <input
            type="text"
            value={featuredQuote.author_role}
            onChange={(e) => setFeaturedQuote({ ...featuredQuote, author_role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            placeholder="e.g., Course Instructor"
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicInfo();
      case 'video':
        return renderVideoIntro();
      case 'learn':
        return renderWhatYouLearn();
      case 'includes':
        return renderCourseIncludes();
      case 'gallery':
        return renderGallery();
      case 'instructors':
        return renderInstructors();
      case 'syllabus':
        return renderSyllabus();
      case 'testimonials':
        return renderTestimonials();
      case 'quote':
        return renderFeaturedQuote();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {course ? 'Edit Course' : 'Create New Course'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.key
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title || !slug}
            className="flex items-center gap-2 px-6 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6a1610] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </div>
    </div>
  );
}
