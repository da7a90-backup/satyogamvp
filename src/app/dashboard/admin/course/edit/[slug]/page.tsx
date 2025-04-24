import CourseForm from "@/components/dashboard/course/CourseForm";

interface EditCoursePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EditCoursePageProps) {
  return {
    title: `Edit Course - Admin Dashboard`,
    description: `Edit course details, content, and instructor information.`,
  };
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = params;

  return (
    <div>
      <CourseForm courseId={id} />
    </div>
  );
}
