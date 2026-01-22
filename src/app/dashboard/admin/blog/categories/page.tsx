import BlogCategories from "@/components/dashboard/blog/BlogCategories";

export const metadata = {
  title: "Blog Categories | Admin Dashboard",
  description: "Manage your blog categories",
};

export const dynamic = 'force-dynamic';

export default function BlogCategoriesPage() {
  return <BlogCategories />;
}
