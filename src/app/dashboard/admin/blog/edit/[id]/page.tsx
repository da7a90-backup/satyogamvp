import { Metadata } from "next";
import BlogPostForm from "@/components/dashboard/blog/BlogPostForm";

export const metadata: Metadata = {
  title: "Edit Blog Post | Admin Dashboard",
  description: "Edit an existing blog post",
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogPostForm postId={id} />;
}
