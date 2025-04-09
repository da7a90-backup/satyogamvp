import { Metadata } from "next";
import BlogIndex from "@/components/dashboard/blog/BlogIndex";

export const metadata: Metadata = {
  title: "Blog Posts | Admin Dashboard",
  description: "Manage your blog posts",
};

export default function BlogIndexPage() {
  return <BlogIndex />;
}
