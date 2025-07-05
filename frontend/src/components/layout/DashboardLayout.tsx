"use client";
import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden transition-all duration-300">
      <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onSidebarToggle={handleSidebarToggle} />
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 