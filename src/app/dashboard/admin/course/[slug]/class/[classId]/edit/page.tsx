import ClassContentEditor from "@/components/dashboard/course/ClassContentEditor";

interface EditClassContentPageProps {
  params: {
    slug: string;
    classId: string;
  };
}

export async function generateMetadata({ params }: EditClassContentPageProps) {
  return {
    title: `Edit Class Content - Admin Dashboard`,
    description: `Edit the video, key concepts, writing prompts, and additional materials for this class.`,
  };
}

export default function EditClassContentPage({
  params,
}: EditClassContentPageProps) {
  const { slug, classId } = params;

  return (
    <div>
      <ClassContentEditor courseId={slug} classId={classId} />
    </div>
  );
}
