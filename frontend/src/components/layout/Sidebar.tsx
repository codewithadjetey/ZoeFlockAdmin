"use client";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useBackupStats } from "@/hooks/useBackupStats";

// Consolidated menu items array with nested sub menus
const allMenuItems = [
  // Main navigation items
  { label: "Dashboard", icon: "fas fa-home", href: "/dashboard", type: "main" },
  { label: "Members", icon: "fas fa-users", href: "/members", type: "main" },
  { label: "Families", icon: "fas fa-house-user", href: "/families", type: "main" },
  { label: "Groups", icon: "fas fa-layer-group", href: "/groups", type: "main" },
  { label: "First Timers", icon: "fas fa-user-plus", href: "/first-timers", type: "main" },
  
  // Import/Export parent with sub menus
  { 
    label: "Import/Export", 
    icon: "fas fa-upload", 
    href: "/import-export", 
    type: "parent",
    subMenus: [
      { label: "Members Import", icon: "fas fa-users", href: "/import-export/members" },
      { label: "Families Import", icon: "fas fa-house-user", href: "/import-export/families" },
      { label: "Groups Import", icon: "fas fa-layer-group", href: "/import-export/groups" },
      { label: "Event Categories Import", icon: "fas fa-tags", href: "/import-export/event_categories" },
      { label: "Partnership Categories Import", icon: "fas fa-list-alt", href: "/import-export/partnership_categories" },
      { label: "Income Categories Import", icon: "fas fa-folder-plus", href: "/import-export/income_categories" },
      { label: "Expense Categories Import", icon: "fas fa-folder-open", href: "/import-export/expense_categories" },
      { label: "Audit Logs", icon: "fas fa-history", href: "/import-export/audit-logs" }
    ]
  },
  
  // Financials parent with sub menus
  { 
    label: "Financials", 
    icon: "fas fa-wallet", 
    href: "/financials", 
    type: "parent",
    subMenus: [
      { label: "Partnerships", icon: "fas fa-hand-holding-usd", href: "/financials/partnerships" },
      { label: "Partnership Category", icon: "fas fa-list-alt", href: "/financials/partnership-categories" },
      { label: "Tithes", icon: "fas fa-church", href: "/financials/tithes" },
      { label: "Income", icon: "fas fa-coins", href: "/financials/income" },
      { label: "Income Category", icon: "fas fa-folder-plus", href: "/financials/income-categories" },
      { label: "Expenses", icon: "fas fa-money-bill-wave", href: "/financials/expenses" },
      { label: "Expenses Category", icon: "fas fa-folder-open", href: "/financials/expenses-categories" }
    ]
  },
  
  // Events parent with sub menus
  { 
    label: "Events", 
    icon: "fas fa-calendar-alt", 
    href: "/events", 
    type: "parent",
    subMenus: [
      { label: "Events", icon: "fas fa-calendar", href: "/events" },
      { label: "Event Categories", icon: "fas fa-tags", href: "/event-categories" }
    ]
  },
  
  // Attendance parent with sub menus
  { 
    label: "Attendance", 
    icon: "fas fa-clipboard-check", 
    href: "/attendance", 
    type: "parent",
    subMenus: [
      { label: "Manage Attendance", icon: "fas fa-clipboard-check", href: "/attendance" },
      { label: "Individual Statistics", icon: "fas fa-chart-line", href: "/attendance/statistics/individual" },
      { label: "General Statistics", icon: "fas fa-chart-bar", href: "/attendance/statistics/general" }
    ]
  },
  
  // Admin parent with sub menus
  { 
    label: "Admin", 
    icon: "fas fa-user-shield", 
    href: "/admin", 
    type: "parent",
    subMenus: [
      { label: "Users", icon: "fas fa-user-cog", href: "/admin/users" },
      { label: "Roles & Permissions", icon: "fas fa-shield-alt", href: "/admin/roles" },
      { label: "Backup & Restore", icon: "fas fa-database", href: "/backups" }
    ]
  },
  
  // Reports parent with sub menus
  { 
    label: "Reports", 
    icon: "fas fa-chart-bar", 
    href: "/reports", 
    type: "parent",
    subMenus: [
      { label: "Reports", icon: "fas fa-chart-bar", href: "/reports" },
      { label: "Tithe Reports", icon: "fas fa-church", href: "/financials/tithes/reports" },
      { label: "Income Reports", icon: "fas fa-chart-line", href: "/reports/income" },
      { label: "Expenses Report", icon: "fas fa-file-invoice-dollar", href: "/reports/expenses" },
      { label: "Income vs Expenses Report", icon: "fas fa-balance-scale", href: "/reports/income-vs-expenses" },
      { label: "Export Report", icon: "fas fa-file-excel", href: "/reports/export" }
    ]
  }
];

// Helper function to get menu items by type
const getMenuItemsByType = (type: string) => {
  return allMenuItems.filter(item => item.type === type);
};

// Helper function to get parent menu items with sub menus
const getParentMenuItems = () => {
  return allMenuItems.filter(item => item.type === "parent");
};

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { currentTheme, colorMode } = useTheme();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const { hasPendingBackups, hasFailedBackups } = useBackupStats();

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        // Only close sidebar on mobile devices
        if (window.innerWidth < 1024) {
          // Check if the click is on an interactive element that shouldn't close the sidebar
          const target = event.target as HTMLElement;
          const isInteractiveElement = target.closest('button') || 
                                     target.closest('input') || 
                                     target.closest('select') || 
                                     target.closest('textarea') ||
                                     target.closest('a') ||
                                     target.closest('[data-view-toggle]') || 
                                     target.closest('.view-toggle-container');
          
          // Only close if it's not an interactive element or if it's a click on the overlay
          if (!isInteractiveElement || target.closest('.mobile-overlay')) {
            onToggle();
          }
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onToggle]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    // window.location.href = "/auth/login";
  };

  const handleNavClick = () => {
    // Only close sidebar on mobile devices
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const toggleSubmenu = (menuType: string) => {
    setOpenSubmenu(openSubmenu === menuType ? null : menuType);
  };



  // Get sidebar background based on theme and color mode
  const getSidebarBackground = () => {
    if (colorMode === 'dark') {
      return 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)';
    }
    return `linear-gradient(180deg, ${currentTheme === 'blue' ? '#1e3a8a' : '#1e293b'} 0%, var(--theme-color) 100%)`;
  };

  // Get border color based on theme and color mode
  const getBorderColor = () => {
    if (colorMode === 'dark') {
      return 'rgba(71, 85, 105, 0.4)';
    }
    return currentTheme === 'blue' ? '#1e40af' : '#334155';
  };

  // Get text color based on color mode
  const getTextColor = () => {
    return colorMode === 'dark' ? '#94a3b8' : '#bfdbfe';
  };

  return (
    <>
      {/* Modern Sidebar */}
      <aside
        ref={sidebarRef}
        className={`w-64 h-screen flex flex-col border-r transition-all duration-300 shadow-2xl z-40 ${
          isOpen ? "fixed translate-x-0" : "fixed lg:static -translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: getSidebarBackground(),
          borderColor: getBorderColor()
        }}
      >
        {/* Modern Logo/Brand Section */}
        <div className="flex items-center justify-center h-24 border-b flex-shrink-0" style={{ borderColor: getBorderColor() }}>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mr-3 shadow-lg border-2 border-white dark:border-gray-600">
              <i className="fas fa-church text-2xl" style={{ color: 'var(--theme-color)' }}></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-['Poppins'] bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Zoe Flock</h1>
              <p className="text-xs" style={{ color: getTextColor() }}>Admin Panel</p>
            </div>
          </div>
        </div>

                  {/* Modern Navigation */}
        <nav className="flex-1 px-6 py-8 space-y-3 overflow-y-auto">
          {/* Main menu items */}
          {getMenuItemsByType("main").map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? "text-white bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20"
                    : "text-blue-100 hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-sm hover:text-white hover:shadow-lg"
                }`}
                onClick={handleNavClick}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i className={`${item.icon} mr-4 text-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}></i>
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}

          {/* Parent menu items with sub menus */}
          {getParentMenuItems().map((parentItem) => {
            const isActive = pathname === parentItem.href || pathname.startsWith(parentItem.href);
            const isOpen = openSubmenu === parentItem.label.toLowerCase();
            
            return (
              <div key={parentItem.label} className="pt-4 border-t border-white/10">
                <button
                  onClick={() => toggleSubmenu(parentItem.label.toLowerCase())}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? "text-white bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20"
                      : "text-blue-100 hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-sm hover:text-white hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <i className={`${parentItem.icon} mr-4 text-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}></i>
                    <span className="relative z-10">{parentItem.label}</span>
                  </div>
                  <i className={`fas fa-chevron-down transition-transform duration-300 relative z-10 ${isOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {/* Sub menus */}
                {isOpen && parentItem.subMenus && (
                  <div className="ml-4 mt-2 space-y-2">
                    {parentItem.subMenus.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      const isBackup = subItem.href === '/backups';
                      
                      return (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                            isSubActive
                              ? "text-white bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm border border-white/15"
                              : "text-blue-100 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:backdrop-blur-sm hover:text-white hover:shadow-md"
                          }`}
                          onClick={handleNavClick}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <i className={`${subItem.icon} mr-3 text-sm group-hover:scale-110 transition-transform duration-300 relative z-10`}></i>
                          <span className="relative z-10 text-sm">{subItem.label}</span>
                          {isBackup && (hasPendingBackups || hasFailedBackups) && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                              <span className="text-xs text-white font-bold">
                                {hasFailedBackups ? '!' : hasPendingBackups ? 'P' : ''}
                              </span>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Modern Logout Button */}
        <div className="p-6 border-t flex-shrink-0" style={{ borderColor: getBorderColor() }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="fas fa-sign-out-alt mr-3 group-hover:scale-110 transition-transform duration-300"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Modern Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 mobile-overlay"
          onClick={() => onToggle()}
        ></div>
      )}
    </>
  );
};

export default Sidebar; 