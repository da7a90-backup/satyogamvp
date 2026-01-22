import { Metadata } from "next";
import RetreatManagement from "@/components/dashboard/retreat/RetreatManagement";

export const metadata: Metadata = {
  title: "Retreats Management | Admin Dashboard",
  description: "Manage retreats and past retreat products",
};

export default function RetreatsPage() {
  return <RetreatManagement />;
}
