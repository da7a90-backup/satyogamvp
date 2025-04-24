import ApiAuthTest from "@/components/ApiAuthTest";

export const metadata = {
  title: "API Authentication Test - Admin Dashboard",
  description: "Test your Strapi API connection and authentication",
};

export default function ApiTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        API Authentication Tester
      </h1>

      <ApiAuthTest />
    </div>
  );
}
