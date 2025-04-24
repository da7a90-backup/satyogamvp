import { Metadata } from "next";
import Image from "next/image";
import { courseApi } from "@/lib/courseApi";
import ReactMarkdown from "react-markdown";
import CourseFeatures from "@/components/dashboard/course/CourseFeatures";
import LearningPoints from "@/components/dashboard/course/LearningPoints";
import FeaturedQuote from "@/components/dashboard/course/FeaturedQuote";
import PreviewMedia from "@/components/dashboard/course/PreviewMedia";
import CourseHeader from "@/components/dashboard/course/CourseHeader";
import EnrollButton from "@/components/dashboard/course/EnrollButton";
import InstructorList from "@/components/dashboard/course/InstructorList";
import { notFound } from "next/navigation";

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const { data: course } = await courseApi.getCourseBySlug(params.slug);

    if (!course) {
      return {
        title: "Course Not Found",
        description: "The requested course could not be found",
      };
    }

    // Use SEO metadata if available, otherwise use course title and description
    const title = course.attributes.seo?.metaTitle || course.attributes.title;
    const description =
      course.attributes.seo?.metaDescription ||
      course.attributes.description.substring(0, 160);

    return {
      title,
      description,
      keywords: course.attributes.seo?.keywords || "",
      openGraph: {
        title,
        description,
        images: course.attributes.seo?.metaImage?.data
          ? [
              `${process.env.NEXT_PUBLIC_STRAPI_URL}${course.attributes.seo.metaImage.data.attributes.url}`,
            ]
          : [],
      },
    };
  } catch (error) {
    console.error("Error fetching course metadata:", error);
    return {
      title: "Course Details",
      description: "Learn more about this course",
    };
  }
}

export default async function CoursePage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const { data: course } = await courseApi.getCourseBySlug(params.slug);

    if (!course) {
      notFound();
    }

    const { attributes } = course;

    // Get featured image URL if available
    const featuredImageUrl = attributes.featuredImage?.data
      ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${attributes.featuredImage.data.attributes.url}`
      : "/images/course-placeholder.jpg"; // Fallback image

    // Format dates if available
    const startDate = attributes.startDate
      ? new Date(attributes.startDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    const endDate = attributes.endDate
      ? new Date(attributes.endDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    // Get instructor data
    const instructors = attributes.instructors?.data || [];

    // Get preview media
    const previewMedia = attributes.previewMedia?.data
      ? attributes.previewMedia.data.map((media: any) => ({
          id: media.id,
          url: `${process.env.NEXT_PUBLIC_STRAPI_URL}${media.attributes.url}`,
          mime: media.attributes.mime,
          name: media.attributes.name,
        }))
      : [];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Course Header with title, price, dates, and enroll button */}
        <CourseHeader
          title={attributes.title}
          isFree={attributes.isFree}
          price={attributes.price}
          startDate={startDate}
          endDate={endDate}
          featuredImageUrl={featuredImageUrl}
        />

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">About this Course</h2>
              <div className="prose max-w-none">
                <ReactMarkdown>{attributes.description}</ReactMarkdown>
              </div>
            </section>

            {/* What You Will Learn */}
            {attributes.whatYouWillLearn?.learningPoints?.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">
                  {attributes.whatYouWillLearn.sectionTitle ||
                    "What You Will Learn"}
                </h2>
                <LearningPoints
                  learningPoints={attributes.whatYouWillLearn.learningPoints}
                />
              </section>
            )}

            {/* Preview Media */}
            {previewMedia.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Preview</h2>
                <PreviewMedia media={previewMedia} />
              </section>
            )}

            {/* Featured Quote */}
            {attributes.featuredQuote?.quoteText && (
              <section className="mb-12">
                <FeaturedQuote
                  quoteText={attributes.featuredQuote.quoteText}
                  authorName={attributes.featuredQuote.authorName}
                  authorImageUrl={
                    attributes.featuredQuote.authorImage?.data
                      ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${attributes.featuredQuote.authorImage.data.attributes.url}`
                      : null
                  }
                />
              </section>
            )}

            {/* Instructors */}
            {instructors.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Your Instructors</h2>
                <InstructorList instructors={instructors} />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Course Features */}
            {attributes.courseFeatures && (
              <section className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-bold mb-4">
                  {attributes.courseFeatures.sectionTitle ||
                    "This Course Includes:"}
                </h3>
                <CourseFeatures features={attributes.courseFeatures} />
              </section>
            )}

            {/* Enrollment CTA */}
            <div className="sticky top-6">
              <EnrollButton
                courseId={course.id}
                isFree={attributes.isFree}
                price={attributes.price}
              />

              {(startDate || endDate) && (
                <div className="mt-4 text-sm text-gray-600">
                  {startDate && <p>Starts: {startDate}</p>}
                  {endDate && <p>Ends: {endDate}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching course:", error);
    notFound();
  }
}
