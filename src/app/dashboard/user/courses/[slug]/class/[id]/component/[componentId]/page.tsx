import { Suspense } from "react";
import ClassComponentLayout from "@/components/dashboard/course/user/ClassComponentLayout";
import ClassVideoComponent from "@/components/dashboard/course/user/ClassVideoComponent";
import ClassKeyConceptsComponent from "@/components/dashboard/course/user/ClassKeyConceptsComponent";
import ClassWritingPromptsComponent from "@/components/dashboard/course/user/ClassWritingPromptsComponent";
import ClassAdditionalMaterialsComponent from "@/components/dashboard/course/user/ClassAdditionalMaterialsComponent";

interface ClassComponentPageProps {
  params: {
    slug: string;
    id: string;
    componentId: string;
  };
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

export const dynamic = 'force-dynamic';

export default function ClassComponentPage({
  params,
}: ClassComponentPageProps) {
  const slug = params.slug;
  const classIndex = parseInt(params.id, 10);
  const componentIndex = parseInt(params.componentId, 10);

  // Render the appropriate component based on the componentIndex
  const renderComponent = () => {
    switch (componentIndex) {
      case 1:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ClassVideoComponent slug={slug} classIndex={classIndex} />
          </Suspense>
        );
      case 2:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ClassKeyConceptsComponent slug={slug} classIndex={classIndex} />
          </Suspense>
        );
      case 3:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ClassWritingPromptsComponent slug={slug} classIndex={classIndex} />
          </Suspense>
        );
      case 4:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ClassAdditionalMaterialsComponent
              slug={slug}
              classIndex={classIndex}
            />
          </Suspense>
        );
      default:
        return <div>Component not found</div>;
    }
  };

  return (
    <ClassComponentLayout
      slug={slug}
      classIndex={classIndex}
      componentIndex={componentIndex}
    >
      {renderComponent()}
    </ClassComponentLayout>
  );
}
