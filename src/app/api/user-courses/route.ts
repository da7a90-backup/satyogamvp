import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  // Get the user session
  const session = await getServerSession(authOptions);

  if (!session?.user?.jwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First fetch published courses
    const coursesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/courses?populate=featuredImage,instructors`,
      {
        headers: {
          Authorization: `Bearer ${session.user.jwt}`,
        },
      }
    );

    if (!coursesResponse.ok) {
      throw new Error(`Courses API responded with ${coursesResponse.status}`);
    }

    const coursesData = await coursesResponse.json();

    // Then fetch minimal user data to get enrolled course IDs
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users/me`,
      {
        headers: {
          Authorization: `Bearer ${session.user.jwt}`,
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error(`User API responded with ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    // If the user has no enrolledCourses field, return empty array
    if (!userData.enrolledCourses) {
      return NextResponse.json({
        data: [],
        meta: { pagination: { total: 0 } },
      });
    }

    // Filter the courses to only include those the user is enrolled in
    const enrolledCourseIds = userData.enrolledCourses.map((c) => c.id);
    const enrolledCourses = coursesData.data.filter((course) =>
      enrolledCourseIds.includes(course.id)
    );

    return NextResponse.json({
      data: enrolledCourses,
      meta: {
        pagination: {
          total: enrolledCourses.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
