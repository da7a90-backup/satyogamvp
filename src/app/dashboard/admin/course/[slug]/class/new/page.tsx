import React from "react";
import NewClassPage from "@/components/dashboard/course/NewClassPage";

interface CourseClassesPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CourseClassesPageProps) {
  return {
    title: `Add New Class - Admin Dashboard`,
    description: `Create a new class for this course.`,
  };
}

export default function CourseNewClassPage({ params }: CourseClassesPageProps) {
  return (
    <div>
      <NewClassPage params={params} />
    </div>
  );
}
