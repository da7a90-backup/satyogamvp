import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import RetreatDetailClient from "@/components/dashboard/retreat/RetreatDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RetreatDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  return (
    <RetreatDetailClient
      slug={slug}
      isAuthenticated={!!session}
      userJwt={session?.user?.accessToken || null}
    />
  );
}
