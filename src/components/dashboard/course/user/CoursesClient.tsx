'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourses } from '@/lib/courses-api';
import { Course } from '@/types/course';
import { Loader2, Search } from 'lucide-react';

interface CoursesClientProps {
  isAuthenticated: boolean;
  userJwt: string | null;
}

export default function CoursesClient({ isAuthenticated, userJwt }: CoursesClientProps) {
  const [activeTab, setActiveTab] = useState<'my-courses' | 'available'>('my-courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();

  // Store JWT in localStorage when it changes
  useEffect(() => {
    if (userJwt) {
      localStorage.setItem('fastapi_token', userJwt);
    }
  }, [userJwt]);

  // Load saved tab from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('coursesActiveTab');
      if (savedTab === 'available' || savedTab === 'my-courses') {
        setActiveTab(savedTab);
      }
    }
  }, []);

  // Fetch courses
  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getCourses();
      setCourses(response.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [isAuthenticated, userJwt]);

  const handleTabChange = (tab: 'my-courses' | 'available') => {
    setActiveTab(tab);
    localStorage.setItem('coursesActiveTab', tab);
  };

  const handleOpenCourse = (slug: string) => {
    router.push(`/dashboard/user/courses/${slug}/overview`);
  };

  const handleEnrollClick = (slug: string) => {
    // Go to the selling page in the dashboard
    router.push(`/dashboard/user/courses/${slug}`);
  };

  const getCourseImageUrl = (course: Course) => {
    if (course.cloudflare_image_id) {
      return `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH}/${course.cloudflare_image_id}/public`;
    }

    if (course.thumbnail_url) {
      if (course.thumbnail_url.startsWith('http')) {
        return course.thumbnail_url;
      }
      const baseUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      return `${baseUrl}${course.thumbnail_url}`;
    }

    return '/placeholder-course.jpg';
  };

  // Filter courses based on active tab and search query
  const myCourses = courses.filter((c) => c.is_enrolled);
  const availableCourses = courses.filter((c) => !c.is_enrolled);

  const filteredCourses = (activeTab === 'my-courses' ? myCourses : availableCourses).filter(
    (course) =>
      !searchQuery ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedCourses = filteredCourses;

  return (
    <div className="min-h-full flex flex-col bg-[#FAF8F1] p-8">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
        {/* Header with Title and Search */}
        <div className="flex justify-between items-center mb-8 flex-shrink-0">
          <h1 className="text-4xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            Courses
          </h1>

          {/* Search Box */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#717680]" size={20} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            />
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-8 border-b border-[#E5E7EB] mb-6 flex-shrink-0">
          <button
            onClick={() => handleTabChange('my-courses')}
            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'my-courses'
                ? 'border-[#7D1A13] text-[#7D1A13]'
                : 'border-transparent text-[#717680] hover:text-[#000000]'
            }`}
          >
            My Courses
          </button>

          <button
            onClick={() => handleTabChange('available')}
            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'available'
                ? 'border-[#7D1A13] text-[#7D1A13]'
                : 'border-transparent text-[#717680] hover:text-[#000000]'
            }`}
          >
            Available to Purchase
          </button>
        </div>

        {/* Results count and Filters */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <p className="text-sm text-[#717680]">
            {displayedCourses.length} {activeTab === 'my-courses' ? 'retreats' : 'retreats'}
          </p>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm hover:bg-gray-50">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M4 9H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Filters</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex-shrink-0">
            {error}
          </div>
        )}

        {/* Content - Flexible height */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading state */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-[#7D1A13] animate-spin" />
            </div>
          ) : (
            <div>
              {/* Empty state */}
              {displayedCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg className="h-8 w-8 text-[#717680]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#000000] mb-2">
                    {activeTab === 'my-courses' ? 'No courses yet' : 'No courses available'}
                  </h2>
                  <p className="text-[#717680] text-center max-w-md mb-8">
                    {activeTab === 'my-courses'
                      ? 'Start your spiritual learning journey by enrolling in your first course.'
                      : 'Check back later for new courses to enrich your practice.'}
                  </p>
                  {activeTab === 'my-courses' && availableCourses.length > 0 && (
                    <button
                      onClick={() => handleTabChange('available')}
                      className="px-6 py-3 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Browse Courses
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                  {displayedCourses.map((course) => {
                    const totalLessons = course.classes?.reduce((total, cls) => total + (cls.components?.length || 0), 0) || 0;
                    const hasVideo = course.classes?.some(cls => cls.components?.some(comp => comp.cloudflare_stream_uid)) || false;
                    const hasAudio = course.classes?.some(cls => cls.components?.some(comp => comp.audio_url)) || false;

                    return (
                      <div
                        key={course.id}
                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Course Image with Badges */}
                        <div className="relative h-48 bg-gray-200">
                          {course.cloudflare_image_id || course.thumbnail_url ? (
                            <img
                              src={getCourseImageUrl(course)}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <div className="flex flex-col items-center gap-4 opacity-30">
                                <svg className="w-20 h-20 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* Content Type Badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            {hasAudio && (
                              <span className="px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded">
                                Audio
                              </span>
                            )}
                            {hasVideo && (
                              <span className="px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded">
                                Video
                              </span>
                            )}
                          </div>

                          {/* Progress indicator for enrolled courses */}
                          {activeTab === 'my-courses' && course.progress_percentage !== undefined && course.progress_percentage > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2">
                              <div className="flex items-center justify-between text-white text-xs mb-1">
                                <span>Progress</span>
                                <span>{Math.round(course.progress_percentage)}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div
                                  className="bg-[#7D1A13] h-1.5 rounded-full transition-all"
                                  style={{ width: `${course.progress_percentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Course Details */}
                        <div className="p-4">
                          {/* Meta Information */}
                          <div className="flex items-center gap-3 mb-3 text-sm text-[#717680]">
                            <div className="flex items-center gap-1">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 14A6 6 0 108 2a6 6 0 000 12z" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                              <span>{totalLessons} lessons</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 8h12M8 2v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                              <span>Online course</span>
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="font-bold text-[#000000] mb-2 line-clamp-2">
                            {course.title}
                          </h3>

                          {/* Description */}
                          {course.description && (
                            <p className="text-sm text-[#717680] line-clamp-2 mb-4">
                              {course.description}
                            </p>
                          )}

                          {/* Action Button */}
                          {activeTab === 'my-courses' ? (
                            <button
                              onClick={() => handleOpenCourse(course.slug)}
                              className="w-full px-4 py-2.5 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                            >
                              {course.progress_percentage && course.progress_percentage > 0
                                ? 'Continue Learning'
                                : 'Start Course'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnrollClick(course.slug)}
                              className="w-full px-4 py-2.5 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                            >
                              Enroll
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
