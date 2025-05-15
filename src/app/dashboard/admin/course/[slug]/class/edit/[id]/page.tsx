"use client";

import { useParams } from "next/navigation";
import EditClassForm from "@/components/dashboard/course/admin/EditClassForm";

export default function Page() {
  const params = useParams();

  // Extract course slug and class ID from the URL parameters
  const slug = params.slug as string;
  const classId = params.id as string;

  return <EditClassForm courseSlug={slug} classId={classId} />;
}
