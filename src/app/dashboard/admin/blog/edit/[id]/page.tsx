import { Metadata } from "next";
import BlogPostForm from "@/components/dashboard/blog/BlogPostForm";

export const metadata: Metadata = {
  title: "Edit Blog Post | Admin Dashboard",
  description: "Edit an existing blog post",
};

export default function EditBlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  return <BlogPostForm postId={params.id} />;
}
