import { Metadata } from "next";
import PortalEditor from "@/components/dashboard/retreat/PortalEditor";

export const metadata: Metadata = {
  title: "Portal Editor | Admin Dashboard",
  description: "Edit retreat portal day-by-day content",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PortalEditorPage({ params }: PageProps) {
  const { id } = await params;

  return <PortalEditor retreatId={id} />;
}
