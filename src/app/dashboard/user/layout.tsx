'use client';

import { useState, Suspense } from 'react';
import UserSidebar from '@/components/dashboard/UserSidebar';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import MobileSidebarDrawer from '@/components/dashboard/MobileSidebarDrawer';
import { CartProvider } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <CartProvider>
      <div className="flex h-screen lg:h-[125vh] gap-0">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Suspense fallback={
            <div className="w-64 h-screen bg-white flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7D1A13]"></div>
            </div>
          }>
            <UserSidebar />
          </Suspense>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto m-0 p-0 pb-20 lg:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav onMoreClick={() => setIsMobileSidebarOpen(true)} />

        {/* Mobile Sidebar Drawer */}
        <MobileSidebarDrawer
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>
      <CartDrawer />
    </CartProvider>
  );
};

export default DashboardLayout;