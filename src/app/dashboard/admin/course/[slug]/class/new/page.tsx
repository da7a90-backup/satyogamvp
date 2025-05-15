"use client";

import NewClassForm from "@/components/dashboard/course/admin/NewClassForm";
import { useParams } from "next/navigation";

export default function NewClassPage() {
  const params = useParams();
  const courseSlug = params.slug as string;

  return (
    <div>
      <NewClassForm courseSlug={courseSlug} />
    </div>
  );
}
