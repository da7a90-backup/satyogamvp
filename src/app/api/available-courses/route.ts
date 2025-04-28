/**
 * Server-side API handler for available courses
 */
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  // Get the user session
  const session = await getServerSession(authOptions);

  if (!session?.user?.jwt) {
    // If not authenticated, return all published courses
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/courses?filters[publishedAt][$notNull]=true&populate=featuredImage,instructors`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Courses API responded with ${response.status}`);
      }

      return NextResponse.json(await response.json());
    } catch (error) {
      console.error("Error fetching public courses:", error);
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 }
      );
    }
  }

  // For authenticated users, show courses they haven't enrolled in yet
  try {
    // First fetch all published courses
    const coursesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/courses?filters[publishedAt][$notNull]=true&populate=featuredImage,instructors`,
      {
        headers: {
          Authorization: `Bearer ${session.user.jwt}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!coursesResponse.ok) {
      throw new Error(`Courses API responded with ${coursesResponse.status}`);
    }

    const coursesData = await coursesResponse.json();

    // Then fetch user data to get enrolled course IDs
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users/me`,
      {
        headers: {
          Authorization: `Bearer ${session.user.jwt}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error(`User API responded with ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    // If the user has no enrolledCourses, return all courses
    if (!userData.enrolledCourses) {
      return NextResponse.json(coursesData);
    }

    // Filter out courses the user is already enrolled in
    const enrolledCourseIds = userData.enrolledCourses.map((c) => c.id);
    const availableCourses = coursesData.data.filter(
      (course) => !enrolledCourseIds.includes(course.id)
    );

    return NextResponse.json({
      data: availableCourses,
      meta: coursesData.meta,
    });
  } catch (error) {
    console.error("Error fetching available courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
