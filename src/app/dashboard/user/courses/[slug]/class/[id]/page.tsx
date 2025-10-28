import ClassPage from "@/components/dashboard/course/user/ClassPage";

export default async function CourseClassPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  return <ClassPage courseSlug={slug} classId={id} />;
}

// Add metadata function for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  try {
    await params;
    // You could fetch the class and course data here to generate dynamic metadata
    // For simplicity, we'll use a generic title
    return {
      title: `Class - Course Learning Platform`,
      description:
        "Learn at your own pace with our comprehensive course materials",
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Class - Course Learning Platform",
    };
  }
}
