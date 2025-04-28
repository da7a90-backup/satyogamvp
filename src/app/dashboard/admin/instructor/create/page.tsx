import InstructorForm from "@/components/dashboard/course/InstructorForm";

export const metadata = {
  title: "Add New Instructor - Admin Dashboard",
  description:
    "Create a new instructor profile with bio, contact information, and photo.",
};

export default function CreateInstructorPage() {
  return (
    <div>
      <InstructorForm />
    </div>
  );
}
