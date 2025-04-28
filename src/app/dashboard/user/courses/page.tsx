import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CoursesClient from "@/components/dashboard/course/user/CoursesClient";

export default async function CoursesPage() {
  // Get the user session
  const session = await getServerSession(authOptions);

  // // Debug - log the session information
  // console.log(
  //   "Courses page - session:",
  //   JSON.stringify(
  //     {
  //       authenticated: !!session,
  //       user: session?.user,
  //       role: session?.user?.role,
  //     },
  //     null,
  //     2
  //   )
  // );

  // Pass the authenticated state and user information to the client component
  return (
    <CoursesClient
      isAuthenticated={!!session}
      userJwt={session?.user?.jwt || null}
    />
  );
}
