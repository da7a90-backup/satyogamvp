'use client';

import AdminSidebar from '@/components/dashboard/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <div className="px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;