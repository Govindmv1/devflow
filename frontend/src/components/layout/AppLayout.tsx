import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Persist sidebar state
  useEffect(() => {
    const stored = localStorage.getItem('df-sidebar-collapsed');
    if (stored) setSidebarCollapsed(stored === 'true');
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('df-sidebar-collapsed', String(next));
  };

  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <TopNav />
        <main
          className="flex-1 p-6 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-page)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
