'use client';

import UserSidebar from '@/components/dashboard/UserSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <UserSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;