'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight, Play, FileText, Edit, CheckCircle2, ArrowLeft } from 'lucide-react';
import { getCourseBySlug } from '@/lib/courses-api';
import { Course, CourseComponent, ComponentCategory } from '@/types/course';

interface CourseOverviewProps {
  slug: string;
  isAuthenticated: boolean;
}

export default function CourseOverview({ slug, isAuthenticated }: CourseOverviewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Check for payment redirect parameters
  useEffect(() => {
    const checkPaymentRedirect = async () => {
      const code = searchParams.get('code');
      const order = searchParams.get('order');
      const tilopayTransaction = searchParams.get('tilopay-transaction');

      // If payment redirect parameters are present, verify the payment
      if (code && order && tilopayTransaction) {
        console.log('Payment redirect detected:', { code, order, tilopayTransaction });
        setVerifyingPayment(true);

        try {
          // Get JWT token from session
          const sessionResponse = await fetch('/api/auth/session');
          const session = await sessionResponse.json();

          // JWT is stored as accessToken in NextAuth session
          const jwtToken = session?.user?.accessToken || session?.user?.jwt;

          if (!jwtToken) {
            console.error('No JWT token in session', session);
            setVerifyingPayment(false);
            return;
          }

          console.log('Confirming payment with backend...');

          // Call backend to confirm payment and enroll
          const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/payments/confirm-redirect`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({
              code,
              order,
              'tilopay-transaction': tilopayTransaction,
              brand: searchParams.get('brand'),
              'last-digits': searchParams.get('last-digits'),
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Payment confirmed and enrolled:', data);

            // Clean URL by removing payment parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);

            // Reload course data to reflect enrollment
            loadCourse();
          } else {
            const errorData = await response.json();
            console.error('Payment confirmation failed:', errorData);
            setError('Payment confirmation failed. Please contact support.');
          }
        } catch (err) {
          console.error('Error confirming payment:', err);
          setError('Failed to confirm payment. Please contact support.');
        } finally {
          setVerifyingPayment(false);
        }
      }
    };

    if (isAuthenticated) {
      checkPaymentRedirect();
    }
  }, [searchParams, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadCourse();
  }, [slug, isAuthenticated]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const data = await getCourseBySlug(slug);
      setCourse(data);

      // Expand first class by default
      if (data.classes && data.classes.length > 0) {
        setExpandedClasses(new Set([data.classes[0].id]));
      }
    } catch (err) {
      console.error('Failed to load course:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = (classId: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedClasses(newExpanded);
  };

  // Format duration for individual components
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:00 hours`;
    }
    return `${minutes} minutes`;
  };

  // Calculate total duration across all classes and components
  const getTotalDuration = (): string => {
    if (!course?.classes) return '0:00 min';

    let totalSeconds = 0;
    course.classes.forEach((cls) => {
      cls.components.forEach((comp) => {
        totalSeconds += comp.duration || 0;
      });
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')} min`;
  };

  const getComponentIcon = (category?: ComponentCategory) => {
    switch (category) {
      case ComponentCategory.VIDEO_LESSON:
        return <Play className="w-4 h-4 text-[#942017]" />;
      case ComponentCategory.KEY_CONCEPTS:
        return <FileText className="w-4 h-4 text-gray-600" />;
      case ComponentCategory.WRITING_PROMPTS:
        return <Edit className="w-4 h-4 text-gray-600" />;
      case ComponentCategory.ADDITIONAL_MATERIALS:
        return <FileText className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getComponentActionButton = (component: CourseComponent) => {
    const progress = component.progress;

    // Completed - show only text with no button (Image 29 style)
    if (progress?.completed) {
      return (
        <span className="text-sm text-green-600 font-medium">100% completed</span>
      );
    }

    // In progress - show percentage + Continue button (Image 29 style)
    if (progress?.progress_percentage && progress.progress_percentage > 0) {
      const displayPercentage = Math.round(progress.progress_percentage);
      return (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">{displayPercentage}% completed</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleComponentClick(component.id);
            }}
            className="px-4 py-1.5 bg-[#942017] text-white text-sm rounded hover:bg-[#7a1a13] transition"
          >
            Continue
          </button>
        </div>
      );
    }

    // Not started - show Start button (Image 29 style)
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleComponentClick(component.id);
        }}
        className="px-4 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition"
      >
        Start
      </button>
    );
  };

  const handleComponentClick = (componentId: string) => {
    router.push(`/dashboard/user/courses/${slug}/component/${componentId}`);
  };

  if (loading || verifyingPayment) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f7f4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#942017] mx-auto mb-4"></div>
          <p className="text-gray-600">{verifyingPayment ? 'Verifying payment and enrolling...' : 'Loading course...'}</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f7f4]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load course</h2>
          <p className="text-gray-600 mb-4">{error || 'Course not found'}</p>
          <button
            onClick={loadCourse}
            className="px-4 py-2 bg-[#942017] text-white rounded hover:bg-[#7a1a13]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!course.can_access) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f7f4]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to enroll in this course to access its content.</p>
          <button
            onClick={() => router.push(`/store/${slug}`)}
            className="px-4 py-2 bg-[#942017] text-white rounded hover:bg-[#7a1a13]"
          >
            View Course Details
          </button>
        </div>
      </div>
    );
  }

  const totalClasses = course.classes?.length || 0;
  const totalDuration = getTotalDuration();

  return (
    <div className="min-h-screen bg-[#FAF8F1]">
      {/* Header Section with Back Button */}
      <div className="px-4 md:px-8 pt-4 md:pt-8 pb-0">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#7D1A13] text-sm font-semibold mb-4 md:mb-6 hover:text-[#942017] transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Course Header Banner */}
      <div className="px-4 md:px-8 pb-6 md:pb-8">
        <div
          className="relative h-[236px] md:h-[272px] rounded-lg overflow-hidden flex items-center justify-center"
          style={{
            backgroundImage: course.thumbnail_url
              ? `linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${course.thumbnail_url})`
              : 'linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="text-center px-8 md:px-16 py-12 md:py-16">
            <p className="text-base md:text-lg font-semibold text-white mb-4 md:mb-6">{course.subtitle || 'Course'}</p>
            <h1 className="text-2xl md:text-4xl font-semibold text-white mb-4 md:mb-6 tracking-tight">{course.title}</h1>
            <p className="text-sm md:text-base font-medium text-white">{course.description || ''}</p>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className="px-4 md:px-8 pt-0 md:pt-8 pb-8">
        <div className="max-w-full">
          {/* Course Content Header */}
          <div className="pb-4 border-b border-[#D2D6DB] mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-black">Course content</h2>
          </div>

          {/* Classes Count and Duration */}
          <div className="flex items-center justify-between pb-4 mb-6">
            <span className="text-base md:text-lg font-semibold text-black">{totalClasses} classes</span>
            <span className="text-base md:text-lg font-semibold text-black text-right">{totalDuration}</span>
          </div>

          {/* Classes List */}
          <div className="space-y-4">
            {course.classes?.map((courseClass) => (
              <div
                key={courseClass.id}
                className="bg-white rounded-lg border border-[#D2D6DB] overflow-hidden"
              >
                {/* Class Header */}
                <button
                  onClick={() => toggleClass(courseClass.id)}
                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition text-left"
                >
                  <span className="text-base md:text-lg font-semibold md:font-bold text-black pr-4">{courseClass.title}</span>
                  {expandedClasses.has(courseClass.id) ? (
                    <ChevronDown className="w-4 h-4 text-[#A4A7AE] flex-shrink-0 transform rotate-180" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#A4A7AE] flex-shrink-0 rotate-90" />
                  )}
                </button>

                {/* Components List */}
                {expandedClasses.has(courseClass.id) && (
                  <div className="border-t border-[#D2D6DB] px-4 py-2 space-y-4">
                    {courseClass.components.map((component, index) => {
                      const isCompleted = component.progress?.completed;
                      const isInProgress = component.progress && component.progress.progress_percentage > 0;
                      const progressPercentage = component.progress?.progress_percentage || 0;

                      return (
                        <div
                          key={component.id}
                          className="border-b border-[#D4D4D4] pb-4 last:border-b-0"
                        >
                          {/* Component Row */}
                          <div className="flex flex-col gap-3">
                            {/* Top Row: Checkbox + Title + Duration */}
                            <div className="flex items-start gap-3">
                              {/* Checkbox */}
                              <div className="flex-shrink-0 mt-0.5">
                                {isCompleted ? (
                                  <div className="w-5 h-5 rounded-full bg-[#F0B7B6] flex items-center justify-center">
                                    <CheckCircle2 className="w-3 h-3 text-[#942017]" />
                                  </div>
                                ) : isInProgress ? (
                                  <div className="w-5 h-5 rounded-full border-2 border-[#942017] flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[#942017]"></div>
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border border-[#D5D7DA]"></div>
                                )}
                              </div>

                              {/* Title and Duration */}
                              <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                                <p className="text-sm md:text-base font-semibold text-[#414651] leading-6">
                                  {component.title}
                                </p>
                                {component.duration && (
                                  <span className="text-sm md:text-base font-medium text-[#414651] whitespace-nowrap">
                                    {formatDuration(component.duration)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Bottom Row: Progress Bar + Badge/Button */}
                            {(isInProgress || isCompleted) && (
                              <div className="flex items-center gap-4 pl-8">
                                {/* Progress Bar */}
                                <div className="flex-1 h-1 bg-[#EEEEEE] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#942017] transition-all duration-300"
                                    style={{
                                      width: `${progressPercentage}%`,
                                    }}
                                  />
                                </div>
                                {/* Percentage Badge */}
                                <span className="text-xs md:text-sm text-black whitespace-nowrap font-normal">
                                  {Math.round(progressPercentage)}% completed
                                </span>
                              </div>
                            )}

                            {/* Action Button */}
                            <div className="pl-8">
                              {isCompleted ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleComponentClick(component.id);
                                  }}
                                  className="w-full md:w-auto px-3 py-2 bg-white border border-[#D5D7DA] text-[#414651] text-sm font-semibold rounded-lg hover:bg-gray-50 transition shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)]"
                                >
                                  Review
                                </button>
                              ) : isInProgress ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleComponentClick(component.id);
                                  }}
                                  className="w-full md:w-auto px-3 py-2 bg-[#7D1A13] text-white text-sm font-semibold rounded-lg hover:bg-[#942017] transition shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)]"
                                >
                                  Continue
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleComponentClick(component.id);
                                  }}
                                  className="w-full md:w-auto px-3 py-2 bg-white border border-[#D5D7DA] text-[#414651] text-sm font-semibold rounded-lg hover:bg-gray-50 transition shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)]"
                                >
                                  Start
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
