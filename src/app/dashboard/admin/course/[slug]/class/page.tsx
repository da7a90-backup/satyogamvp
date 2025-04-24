import CourseClassManager from "@/components/dashboard/course/CourseClassManager";

interface CourseClassesPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CourseClassesPageProps) {
  return {
    title: `Course Classes - Admin Dashboard`,
    description: `Manage the classes and content structure for this course.`,
  };
}

export default function CourseClassesPage({ params }: CourseClassesPageProps) {
  const { slug } = params;

  return (
    <div>
      <CourseClassManager courseId={slug} />
    </div>
  );
}
