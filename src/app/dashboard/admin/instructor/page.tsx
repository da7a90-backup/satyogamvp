import InstructorIndex from "@/components/dashboard/course/admin/InstructorIndex";

export const metadata = {
  title: "Instructors Management - Admin Dashboard",
  description:
    "Manage your course instructors, add new instructors, and edit existing ones.",
};

export default function InstructorsPage() {
  return (
    <div>
      <InstructorIndex />
    </div>
  );
}
