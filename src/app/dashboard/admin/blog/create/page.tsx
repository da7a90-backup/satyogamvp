import { Metadata } from "next";
import BlogPostForm from "@/components/dashboard/blog/BlogPostForm";

export const metadata: Metadata = {
  title: "Create Blog Post | Admin Dashboard",
  description: "Create a new blog post",
};

export default function CreateBlogPostPage() {
  return <BlogPostForm />;
}
