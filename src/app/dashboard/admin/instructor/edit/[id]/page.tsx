import InstructorForm from "@/components/dashboard/course/admin/InstructorForm";

interface EditInstructorPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EditInstructorPageProps) {
  return {
    title: `Edit Instructor - Admin Dashboard`,
    description: `Edit instructor profile, bio, contact information, and photo.`,
  };
}

export default function EditInstructorPage({
  params,
}: EditInstructorPageProps) {
  const { id } = params;

  return (
    <div>
      <InstructorForm instructorId={id} />
    </div>
  );
}
