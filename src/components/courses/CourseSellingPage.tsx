'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { ChevronDown, ChevronRight, ChevronLeft as ChevronLeftIcon } from 'lucide-react';
import { getCourseBySlug } from '@/lib/courses-api';
import { Course } from '@/types/course';
import CloudflareVideoPlayer from './CloudflareVideoPlayer';

interface CourseSellingPageProps {
  slug: string;
  session: Session | null;
}

export default function CourseSellingPage({ slug, session }: CourseSellingPageProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getCourseBySlug(slug);
        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  const handleEnroll = () => {
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/dashboard/user/courses/${slug}`)}`);
      return;
    }

    if (course?.is_enrolled) {
      router.push(`/dashboard/user/courses/${slug}/overview`);
      return;
    }

    // Navigate to payment page
    router.push(`/dashboard/user/courses/${slug}/payment`);
  };

  const nextGalleryImage = () => {
    if (course?.selling_page_data?.gallery_images) {
      setCurrentGalleryIndex((prev) =>
        prev === course.selling_page_data.gallery_images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevGalleryImage = () => {
    if (course?.selling_page_data?.gallery_images) {
      setCurrentGalleryIndex((prev) =>
        prev === 0 ? course.selling_page_data.gallery_images!.length - 1 : prev - 1
      );
    }
  };

  const nextTestimonial = () => {
    if (course?.selling_page_data?.testimonials) {
      setCurrentTestimonialIndex((prev) =>
        prev === course.selling_page_data.testimonials!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevTestimonial = () => {
    if (course?.selling_page_data?.testimonials) {
      setCurrentTestimonialIndex((prev) =>
        prev === 0 ? course.selling_page_data.testimonials!.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Course Not Found</h1>
          <p className="text-[#414651] mb-6">{error || 'The requested course could not be found.'}</p>
          <button
            onClick={() => router.push('/courses')}
            className="px-6 py-2.5 bg-[#7D1A13] text-white rounded hover:bg-[#6a1610] transition"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const getCourseImageUrl = () => {
    const heroData = course.selling_page_data?.hero_cloudflare_image_id || course.cloudflare_image_id;
    if (heroData) {
      return `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH}/${heroData}/public`;
    }
    const heroUrl = course.selling_page_data?.hero_image_url || course.thumbnail_url;
    if (heroUrl) {
      if (heroUrl.startsWith('http')) {
        return heroUrl;
      }
      const baseUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      return `${baseUrl}${heroUrl}`;
    }
    return '/placeholder-course.jpg';
  };

  const getGalleryImageUrl = (imageData: { url?: string; cloudflare_image_id?: string }) => {
    if (imageData.cloudflare_image_id) {
      return `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH}/${imageData.cloudflare_image_id}/public`;
    }
    if (imageData.url) {
      if (imageData.url.startsWith('http')) {
        return imageData.url;
      }
      const baseUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      return `${baseUrl}${imageData.url}`;
    }
    return '/placeholder-gallery.jpg';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F1]">
      {/* Header Section - Back button */}
      <div className="flex flex-col items-start px-8 pt-8 pb-0 gap-6 w-full">
        <div className="flex flex-col items-start p-0 gap-6 w-full max-w-[1120px] mx-auto">
          <div className="flex flex-col items-start p-0 gap-5 w-full">
            <button
              onClick={() => router.back()}
              className="flex flex-row justify-center items-center p-0 gap-1.5 text-[#7D1A13] hover:opacity-80 transition"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="#7D1A13" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['Avenir_Next'] font-semibold text-sm leading-5">Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Header */}
      <div className="flex flex-col items-center px-16 py-20 gap-6 w-full bg-[#FAF8F1]">
        <div className="flex flex-row items-start p-0 pb-12 gap-10 w-full max-w-[1056px]">
          {/* Left: Featured Image */}
          <div className="flex flex-col items-start p-0 gap-4 w-[500px] h-[490px] rounded-lg overflow-hidden">
            <div className="flex flex-row items-start p-0 gap-4 w-[500px] h-[490px]">
              <img
                src={getCourseImageUrl()}
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Right: Product Description */}
          <div className="flex flex-col items-start p-0 gap-8 w-[516px]">
            <div className="flex flex-col items-start p-0 gap-6 w-full">
              {/* Product Name */}
              <div className="flex flex-col items-start p-0 gap-2 w-full">
                {/* Tagline */}
                <div className="flex flex-row items-center p-0 w-full h-12">
                  <p className="font-['Avenir_Next'] font-semibold text-base leading-[150%] uppercase text-[#9C7520] flex-grow">
                    {course.price === 0 ? 'FREE COURSE' : 'COURSE'}
                  </p>
                </div>

                {/* Heading */}
                <h1 className="font-['Optima'] font-bold text-5xl leading-[60px] tracking-[-0.02em] text-black w-full">
                  {course.title}
                </h1>

                {/* Price */}
                <div className="flex flex-row items-center p-0 gap-2 w-full h-[34px]">
                  <h2 className="font-['Inter'] font-bold text-2xl leading-[140%] text-black">
                    {course.price === 0 ? 'Free' : `$${course.price} USD, all inclusive`}
                  </h2>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col items-start p-0 gap-2 w-full">
                <p className="font-['Avenir_Next'] font-normal text-lg leading-7 text-[#414651] w-full">
                  {course.selling_page_data?.short_description || course.description}
                </p>
              </div>

              {/* Course Stats */}
              {(course.selling_page_data?.total_duration || course.selling_page_data?.total_lectures) && (
                <div className="flex flex-row items-center gap-4 w-full">
                  {course.selling_page_data?.total_duration && (
                    <p className="font-['Avenir_Next'] font-normal text-sm text-[#414651]">
                      {course.selling_page_data.total_duration}
                    </p>
                  )}
                  {course.selling_page_data?.total_lectures && (
                    <p className="font-['Avenir_Next'] font-normal text-sm text-[#414651]">
                      {course.selling_page_data.total_lectures} lectures
                    </p>
                  )}
                </div>
              )}

              {/* Enroll Button */}
              <div className="flex flex-col items-start p-0 gap-6 w-full">
                <div className="flex flex-col items-start pt-2 p-0 gap-4 w-full">
                  <div className="flex flex-col items-start p-0 gap-4 w-full">
                    <button
                      onClick={handleEnroll}
                      className="flex flex-row justify-center items-center py-3 px-[18px] gap-1.5 w-full h-12 bg-[#7D1A13] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] hover:bg-[#6a1610] transition"
                    >
                      <div className="flex flex-row justify-center items-center px-0.5 py-0">
                        <span className="font-['Avenir_Next'] font-semibold text-base leading-6 text-white">
                          {course.is_enrolled ? 'Go to Course' : course.price === 0 ? 'Start for Free' : 'Enroll Now'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Introduction Section */}
      {course.selling_page_data?.intro_video_cloudflare_uid && (
        <div className="flex flex-col items-center px-16 py-16 gap-6 w-full bg-[#FAF8F1]">
          <div className="flex flex-col items-center p-0 gap-6 w-full max-w-[1056px]">
            {/* Video Player */}
            <div className="w-full rounded-lg overflow-hidden shadow-lg">
              <CloudflareVideoPlayer
                videoId={course.selling_page_data.intro_video_cloudflare_uid}
                autoplay={false}
              />
            </div>

            {/* Video Title and Description */}
            {(course.selling_page_data.intro_video_title || course.selling_page_data.intro_video_description) && (
              <div className="flex flex-col items-start p-0 gap-2 w-full">
                {course.selling_page_data.intro_video_title && (
                  <h3 className="font-['Avenir_Next'] font-semibold text-xl leading-[30px] text-black">
                    {course.selling_page_data.intro_video_title}
                  </h3>
                )}
                {course.selling_page_data.intro_video_description && (
                  <p className="font-['Avenir_Next'] font-normal text-lg leading-7 text-[#414651]">
                    {course.selling_page_data.intro_video_description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* What You Will Learn Section */}
      {course.selling_page_data?.what_you_will_learn && course.selling_page_data.what_you_will_learn.length > 0 && (
        <div className="flex flex-col items-start px-16 py-16 gap-6 w-full bg-[#FAF8F1]">
          <div className="flex flex-col items-start p-0 gap-4 w-full max-w-[812px] mx-auto">
            <h2 className="font-['Optima'] font-bold text-5xl leading-[60px] tracking-[-0.02em] text-black w-full">
              What you will learn
            </h2>
          </div>

          <div className="flex flex-col items-start p-0 gap-8 w-full max-w-[1056px] mx-auto">
            {course.selling_page_data.what_you_will_learn.map((item, index) => (
              <div key={index} className="flex flex-row items-start p-0 gap-4 w-full">
                <div className="flex flex-col justify-center items-start p-0 w-full">
                  <div className="flex flex-row items-center p-0 gap-1">
                    <ChevronRight className="w-4 h-4 text-black -rotate-90" />
                    <h3 className="font-['Avenir_Next'] font-semibold text-xl leading-[30px] text-black">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex flex-row justify-center items-center pl-5 p-0 gap-2.5 w-full">
                    <p className="font-['Avenir_Next'] font-normal text-lg leading-7 text-[#414651] flex-grow">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* This Course Includes */}
      {course.selling_page_data?.course_includes && course.selling_page_data.course_includes.length > 0 && (
        <div className="flex flex-col items-start px-16 py-16 gap-8 w-full bg-[#FAF8F1]">
          <div className="flex flex-col items-start p-0 gap-4 w-full max-w-[812px] mx-auto">
            <h2 className="font-['Optima'] font-bold text-5xl leading-[60px] tracking-[-0.02em] text-black w-full">
              This {course.price === 0 ? 'course' : 'Online Course'} includes:
            </h2>
          </div>

          <div className="flex flex-col items-start p-0 gap-4 w-full max-w-[1056px] mx-auto">
            <ul className="flex flex-col gap-2 w-full">
              {course.selling_page_data.course_includes.map((item, index) => (
                <li key={index} className="flex flex-row items-start p-0 gap-2">
                  <ChevronRight className="w-4 h-4 text-black -rotate-90 mt-1.5 flex-shrink-0" />
                  <span className="font-['Avenir_Next'] font-normal text-lg leading-7 text-[#414651]">
                    {item.title}
                    {item.description && `: ${item.description}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Gallery Section */}
      {course.selling_page_data?.gallery_images && course.selling_page_data.gallery_images.length > 0 && (
        <div className="flex flex-col items-center px-16 py-16 gap-6 w-full bg-[#FAF8F1]">
          <div className="flex flex-col items-center p-0 gap-6 w-full max-w-[1056px]">
            {/* Gallery Carousel */}
            <div className="relative w-full flex items-center justify-center gap-4">
              {/* Previous Button */}
              {course.selling_page_data.gallery_images.length > 1 && (
                <button
                  onClick={prevGalleryImage}
                  className="absolute left-0 z-10 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-[#7D1A13]" />
                </button>
              )}

              {/* Images Container */}
              <div className="flex gap-4 overflow-hidden">
                {course.selling_page_data.gallery_images.slice(currentGalleryIndex, currentGalleryIndex + 3).map((image, index) => (
                  <div key={currentGalleryIndex + index} className="flex-shrink-0 w-[340px] h-[240px] rounded-lg overflow-hidden">
                    <img
                      src={getGalleryImageUrl(image)}
                      alt={image.alt || `Gallery image ${currentGalleryIndex + index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Next Button */}
              {course.selling_page_data.gallery_images.length > 1 && (
                <button
                  onClick={nextGalleryImage}
                  className="absolute right-0 z-10 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-[#7D1A13]" />
                </button>
              )}
            </div>

            {/* Dots Indicator */}
            {course.selling_page_data.gallery_images.length > 1 && (
              <div className="flex gap-2">
                {course.selling_page_data.gallery_images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentGalleryIndex(index)}
                    className={`w-2 h-2 rounded-full transition ${
                      index === currentGalleryIndex ? 'bg-[#7D1A13]' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Featured Quote Section */}
      {course.selling_page_data?.featured_quote && (
        <div className="flex flex-col items-center px-16 py-16 gap-6 w-full bg-[#F5F1E8]">
          <div className="flex flex-col items-center p-0 gap-6 w-full max-w-[812px] text-center">
            <p className="font-['Optima'] font-normal text-2xl leading-9 italic text-black">
              "{course.selling_page_data.featured_quote.text}"
            </p>
            {(course.selling_page_data.featured_quote.author || course.selling_page_data.featured_quote.author_role) && (
              <div className="flex flex-col items-center gap-1">
                {course.selling_page_data.featured_quote.author && (
                  <p className="font-['Avenir_Next'] font-semibold text-base text-black">
                    {course.selling_page_data.featured_quote.author}
                  </p>
                )}
                {course.selling_page_data.featured_quote.author_role && (
                  <p className="font-['Avenir_Next'] font-normal text-sm text-[#414651]">
                    {course.selling_page_data.featured_quote.author_role}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructors Section */}
      {course.selling_page_data?.instructors && course.selling_page_data.instructors.length > 0 && (
        <div className="flex flex-col items-start px-16 py-16 gap-6 w-full bg-[#FAF8F1]">
          <div className="flex flex-col items-start p-0 gap-4 w-full max-w-[812px] mx-auto">
            <h2 className="font-['Optima'] font-bold text-5xl leading-[60px] tracking-[-0.02em] text-black w-full">
              Your Instructors for this Course
            </h2>
          </div>

          <div className="flex flex-col items-start p-0 gap-12 w-full max-w-[1056px] mx-auto">
            {course.selling_page_data.instructors.map((instructor, index) => (
              <div key={index} className="flex flex-row items-start p-0 gap-8 w-full">
                {instructor.photo_url && (
                  <img
                    src={instructor.photo_url}
                    alt={instructor.name}
                    className="w-[140px] h-[170px] rounded-lg object-cover flex-shrink-0"
                  />
                )}

                <div className="flex flex-col items-start p-0 flex-grow">
                  <div className="flex flex-col items-start p-0 gap-2 w-full">
                    <h3 className="font-['Avenir_Next'] font-semibold text-xl leading-[30px] text-black">
                      {instructor.name}
                    </h3>
                    <p className="font-['Avenir_Next'] font-normal text-lg leading-7 text-[#414651] w-full">
                      {instructor.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Syllabus Section */}
      {course.selling_page_data?.syllabus && course.selling_page_data.syllabus.length > 0 && (
        <div className="flex flex-col justify-center items-start px-16 py-28 gap-6 w-full bg-[#FAF8F1]">
          <div className="flex flex-col items-start p-0 gap-6 w-full max-w-[1056px] mx-auto">
            {/* Section Title */}
            <div className="flex flex-col items-start p-0 gap-6 w-full">
              <h2 className="font-['Optima'] font-bold text-5xl leading-[60px] tracking-[-0.02em] text-black w-full">
                Syllabus
              </h2>

              <div className="flex flex-row justify-between items-start p-0 gap-6 w-full">
                <p className="font-['Avenir_Next'] font-normal text-lg leading-7 text-[#414651]">
                  {course.selling_page_data.syllabus.length} lesson course curriculum
                </p>
              </div>
            </div>

            {/* Accordion */}
            <div className="flex flex-row justify-center items-center p-0 gap-2.5 w-full">
              <div className="flex flex-col items-start p-0 gap-4 w-[812px]">
                {course.selling_page_data.syllabus.map((lesson) => (
                  <div
                    key={lesson.lesson_number}
                    className="flex flex-col justify-center items-center py-5 px-6 gap-6 w-full bg-white border border-[#D2D6DB] rounded-lg"
                  >
                    {/* Header */}
                    <button
                      onClick={() => setExpandedLesson(expandedLesson === lesson.lesson_number ? null : lesson.lesson_number)}
                      className="flex flex-row justify-between items-center p-0 w-full"
                    >
                      <div className="flex flex-row items-center p-0 gap-2 flex-grow">
                        <ChevronDown
                          className={`w-8 h-8 text-black transition-transform ${
                            expandedLesson === lesson.lesson_number ? 'rotate-90' : ''
                          }`}
                        />
                        <h3 className="font-['Avenir_Next'] font-semibold text-xl leading-[30px] text-[#942017] flex-grow text-left">
                          {lesson.title}
                        </h3>
                      </div>
                      <div className="flex flex-row items-center p-0 gap-2">
                        <span className="font-['Avenir_Next'] font-normal text-sm text-[#384250]">
                          {lesson.duration}
                        </span>
                        <span className="font-['Avenir_Next'] font-semibold text-lg leading-7 text-[#384250]">
                          {lesson.lectures_count} lectures
                        </span>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {expandedLesson === lesson.lesson_number && (
                      <div className="flex flex-col items-start pl-10 p-0 gap-4 w-full">
                        {lesson.lesson_items.map((item, index) => (
                          <div key={index} className="flex flex-col items-start p-0 gap-1 w-full">
                            <p className="font-['Avenir_Next'] font-normal text-base leading-6 text-[#414651] w-full">
                              • {item}
                            </p>
                          </div>
                        ))}

                        {/* Additional Materials */}
                        {lesson.additional_materials && lesson.additional_materials.length > 0 && (
                          <div className="flex flex-col items-start p-0 gap-2 w-full mt-4">
                            <p className="font-['Avenir_Next'] font-semibold text-base leading-6 text-black">
                              Additional course material will be added:
                            </p>
                            <ul className="flex flex-col gap-1 w-full pl-4">
                              {lesson.additional_materials.map((material, index) => (
                                <li key={index} className="font-['Avenir_Next'] font-normal text-base leading-6 text-[#414651]">
                                  • {material.type === 'video' && 'Video: '}
                                  {material.type === 'essay' && 'Essay: '}
                                  {material.type === 'meditation' && 'Guided meditation: '}
                                  {material.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Testimonials Section */}
      {course.selling_page_data?.testimonials && course.selling_page_data.testimonials.length > 0 && (
        <div className="flex flex-col items-center px-16 py-16 gap-12 w-full bg-[#FAF8F1]">
          <div className="flex flex-col items-center p-0 gap-6 w-full max-w-[812px]">
            <h2 className="font-['Optima'] font-bold text-5xl leading-[60px] tracking-[-0.02em] text-black text-center">
              What students say about us
            </h2>
          </div>

          {/* Testimonials Carousel */}
          <div className="relative w-full flex items-center justify-center">
            {/* Previous Button */}
            {course.selling_page_data.testimonials.length > 1 && (
              <button
                onClick={prevTestimonial}
                className="absolute left-0 z-10 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
                aria-label="Previous testimonial"
              >
                <ChevronLeftIcon className="w-6 h-6 text-[#7D1A13]" />
              </button>
            )}

            {/* Testimonial Cards */}
            <div className="flex gap-8 overflow-hidden max-w-[900px]">
              {[0, 1, 2].map((offset) => {
                const index = (currentTestimonialIndex + offset) % course.selling_page_data!.testimonials!.length;
                const testimonial = course.selling_page_data!.testimonials![index];

                return (
                  <div key={index} className="flex-shrink-0 w-[280px] flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-sm">
                    <p className="font-['Avenir_Next'] font-normal text-base leading-6 text-[#414651] text-center">
                      "{testimonial.text}"
                    </p>
                    <div className="flex flex-col items-center gap-2">
                      {testimonial.avatar_url && (
                        <img
                          src={testimonial.avatar_url}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex flex-col items-center">
                        <p className="font-['Avenir_Next'] font-semibold text-sm text-black">
                          {testimonial.name}
                        </p>
                        {testimonial.role && (
                          <p className="font-['Avenir_Next'] font-normal text-xs text-[#414651]">
                            {testimonial.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Button */}
            {course.selling_page_data.testimonials.length > 1 && (
              <button
                onClick={nextTestimonial}
                className="absolute right-0 z-10 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6 text-[#7D1A13]" />
              </button>
            )}
          </div>

          {/* Dots Indicator */}
          {course.selling_page_data.testimonials.length > 1 && (
            <div className="flex gap-2">
              {course.selling_page_data.testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  className={`w-2 h-2 rounded-full transition ${
                    index === currentTestimonialIndex ? 'bg-[#7D1A13]' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Final CTA */}
      <div className="flex flex-col items-center px-16 py-28 gap-20 w-full bg-[#FAF8F1]">
        <div className="flex flex-col items-center p-0 gap-8 max-w-[768px]">
          <div className="flex flex-row items-start p-0 gap-4">
            <button
              onClick={handleEnroll}
              className="flex flex-row justify-center items-center py-3 px-6 gap-2 h-12 bg-[#7D1A13] rounded-lg hover:bg-[#6a1610] transition"
            >
              <span className="font-['Avenir_Next'] font-semibold text-base leading-6 text-white">
                {course.is_enrolled ? 'Go to Course' : course.price === 0 ? 'Start for Free' : 'Enroll Now'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
