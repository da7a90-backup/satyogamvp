import CourseIndex from "@/components/dashboard/course/admin/CourseIndex";

export const metadata = {
  title: "Courses Management - Admin Dashboard",
  description:
    "Manage your courses, add new courses, edit existing ones, and organize course content.",
};

export default function CoursesPage() {
  return (
    <div>
      <CourseIndex />
    </div>
  );
}
