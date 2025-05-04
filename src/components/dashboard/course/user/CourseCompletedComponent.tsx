"use client";

import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { courseApi } from "@/lib/courseApi";
import Link from "next/link";

interface CourseCompletedComponentProps {
  slug: string;
  completionPercentage: number;
}

interface Course {
  id: number;
  attributes: {
    title: string;
    slug: string;
  };
}

const CourseCompletedComponent = ({
  slug,
  completionPercentage,
}: CourseCompletedComponentProps) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

  // Mock data for recommended courses
  const recommendedCourses = [
    {
      id: 1,
      title: "Advanced Meditation Techniques",
      slug: "advanced-meditation-techniques",
    },
    {
      id: 2,
      title: "Mindfulness for Daily Life",
      slug: "mindfulness-daily-life",
    },
  ];

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await courseApi.getCourseBySlug(slug);

        if (response) {
          setCourse(response);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  const handleGenerateCertificate = () => {
    if (completionPercentage < 100) return;

    setIsGeneratingCertificate(true);

    // Mock certificate generation
    setTimeout(() => {
      setIsGeneratingCertificate(false);
      // In a real application, this would redirect to a certificate page or download a PDF
      alert("Certificate generated successfully!");
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Course information not available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 text-green-600 mb-6">
          <CheckCircleIcon className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-bold mb-4">
          Course completion: {completionPercentage}%
        </h2>
        <p className="text-gray-600 mb-8">
          {completionPercentage === 100
            ? `Congratulations! You've completed "${course.attributes.title}".`
            : `You're making great progress in "${course.attributes.title}". Keep going!`}
        </p>

        {/* Progress bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full mb-8">
          <div
            className="h-3 bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        {/* Certificate section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-left mb-12">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <AcademicCapIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">
                Certificate of Completion
              </h3>
              <p className="text-gray-600 mb-6">
                {completionPercentage === 100
                  ? "Your certificate is ready! Generate your personalized certificate to celebrate your achievement."
                  : `Complete the remaining ${
                      100 - completionPercentage
                    }% of the course to unlock your certificate.`}
              </p>
              <button
                onClick={handleGenerateCertificate}
                className={`px-6 py-3 rounded-md bg-purple-600 text-white font-medium flex items-center
                  ${
                    completionPercentage === 100
                      ? "hover:bg-purple-700"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                disabled={
                  completionPercentage !== 100 || isGeneratingCertificate
                }
              >
                {isGeneratingCertificate ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                    Generating...
                  </>
                ) : (
                  "View Certificate"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations section */}
      <div className="mt-12">
        <h3 className="text-xl font-bold mb-6">Recommended next steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Join the Community</h4>
                <p className="text-gray-600 mb-4">
                  Connect with fellow students and continue discussions about
                  meditation practices.
                </p>
                <a
                  href="#"
                  className="text-purple-600 font-medium hover:text-purple-800 flex items-center"
                >
                  Explore Community
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <AcademicCapIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Deepen Your Practice</h4>
                <p className="text-gray-600 mb-4">
                  Join one of our live online retreats to experience guided
                  meditation with our teachers.
                </p>
                <a
                  href="#"
                  className="text-purple-600 font-medium hover:text-purple-800 flex items-center"
                >
                  View Upcoming Retreats
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended courses */}
        <h3 className="text-xl font-bold mb-4">
          Continue your learning journey
        </h3>
        <div className="border border-gray-200 rounded-lg divide-y">
          {recommendedCourses.map((course) => (
            <div key={course.id} className="p-4 hover:bg-gray-50">
              <Link
                href={`/dashboard/user/courses/${course.slug}`}
                className="flex justify-between items-center"
              >
                <span className="font-medium">{course.title}</span>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Return to course button */}
      <div className="text-center mt-12">
        <Link
          href={`/dashboard/user/courses/${slug}/overview`}
          className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Return to course
        </Link>
      </div>
    </div>
  );
};

export default CourseCompletedComponent;
