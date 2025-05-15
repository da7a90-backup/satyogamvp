import CourseForm from "@/components/dashboard/course/admin/CourseForm";

export const metadata = {
  title: "Create New Course - Admin Dashboard",
  description:
    "Create a new course with details, content structure, and instructor information.",
};

export default function CreateCoursePage() {
  return (
    <div>
      <CourseForm />
    </div>
  );
}
