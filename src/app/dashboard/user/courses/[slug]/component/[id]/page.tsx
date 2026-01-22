import ComponentViewer from '@/components/dashboard/course/components/ComponentViewer';

interface ComponentPageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function ComponentPage({ params }: ComponentPageProps) {
  const { slug, id } = await params;

  return <ComponentViewer courseSlug={slug} componentId={id} />;
}
