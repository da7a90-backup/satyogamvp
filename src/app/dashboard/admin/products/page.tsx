import { Metadata } from "next";
import StoreManagement from "@/components/dashboard/store/StoreManagement";

export const metadata: Metadata = {
  title: "Products Management | Admin Dashboard",
  description: "Manage store products and link to retreats",
};

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  return <StoreManagement />;
}
