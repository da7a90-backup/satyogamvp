import { Metadata } from "next";
import BlogCommentsManagement from "@/components/dashboard/blog/BlogCommentsManagement";

export const metadata: Metadata = {
  title: "Blog Comments | Admin Dashboard",
  description: "Manage blog comments and moderation",
};

export default function BlogCommentsPage() {
  return <BlogCommentsManagement />;
}
