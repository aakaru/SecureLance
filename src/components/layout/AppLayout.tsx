import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
export const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar collapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col">
          <Header sidebarCollapsed={isSidebarCollapsed} />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default AppLayout;
