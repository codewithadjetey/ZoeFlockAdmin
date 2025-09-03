"use client";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useBackupStats } from "@/hooks/useBackupStats";

// Consolidated menu items array
const allMenuItems = [
  // Main navigation items
  { label: "Dashboard", icon: "fas fa-home", href: "/dashboard", type: "main" },
  { label: "Members", icon: "fas fa-users", href: "/members", type: "main" },
  { label: "Families", icon: "fas fa-house-user", href: "/families", type: "main" },
  { label: "Groups", icon: "fas fa-layer-group", href: "/groups", type: "main" },
  { label: "First Timers", icon: "fas fa-user-plus", href: "/first-timers", type: "main" },
  // { label: "Communication", icon: "fas fa-envelope", href: "/communication", type: "main" },
  
  // Import/Export menu items
  { label: "Import/Export", icon: "fas fa-upload", href: "/import-export", type: "import" },
  { label: "Members Import", icon: "fas fa-users", href: "/import-export/members", type: "import" },
  { label: "Families Import", icon: "fas fa-house-user", href: "/import-export/families", type: "import" },
  { label: "Groups Import", icon: "fas fa-layer-group", href: "/import-export/groups", type: "import" },
  { label: "Event Categories Import", icon: "fas fa-tags", href: "/import-export/event_categories", type: "import" },
  { label: "Partnership Categories Import", icon: "fas fa-list-alt", href: "/import-export/partnership_categories", type: "import" },
  { label: "Income Categories Import", icon: "fas fa-folder-plus", href: "/import-export/income-categories", type: "import" },
  { label: "Expense Categories Import", icon: "fas fa-folder-open", href: "/import-export/expense-categories", type: "import" },
  { label: "Audit Logs", icon: "fas fa-history", href: "/import-export/audit-logs", type: "import" },
  
  // Financials menu items
  { label: "Partnerships", icon: "fas fa-hand-holding-usd", href: "/financials/partnerships", type: "financials" },
  { label: "Partnership Category", icon: "fas fa-list-alt", href: "/financials/partnership-categories", type: "financials" },
  { label: "Tithes", icon: "fas fa-church", href: "/financials/tithes", type: "financials" },
  { label: "Income", icon: "fas fa-coins", href: "/financials/income", type: "financials" },
  { label: "Income Category", icon: "fas fa-folder-plus", href: "/financials/income-categories", type: "financials" },
  { label: "Expenses", icon: "fas fa-money-bill-wave", href: "/financials/expenses", type: "financials" },
  { label: "Expenses Category", icon: "fas fa-folder-open", href: "/financials/expenses-categories", type: "financials" },
  
  // Events menu items
  { label: "Events", icon: "fas fa-calendar", href: "/events", type: "events" },
  { label: "Event Categories", icon: "fas fa-tags", href: "/event-categories", type: "events" },
  
  // Attendance menu items
  { label: "Manage Attendance", icon: "fas fa-clipboard-check", href: "/attendance", type: "attendance" },
  { label: "Individual Statistics", icon: "fas fa-chart-line", href: "/attendance/statistics/individual", type: "attendance" },
  { label: "General Statistics", icon: "fas fa-chart-bar", href: "/attendance/statistics/general", type: "attendance" },
  
  // Settings menu items
  { label: "General", icon: "fas fa-cog", href: "/settings", type: "settings" },
  { label: "Appearance", icon: "fas fa-palette", href: "/settings/appearance", type: "settings" },
  { label: "Notifications", icon: "fas fa-bell", href: "/settings/notifications", type: "settings" },
  { label: "Security", icon: "fas fa-shield-alt", href: "/settings/security", type: "settings" },
  
  // System menu items
  
  // Admin menu items
  { label: "Users", icon: "fas fa-user-cog", href: "/admin/users", type: "admin" },
  { label: "Roles & Permissions", icon: "fas fa-shield-alt", href: "/admin/roles", type: "admin" },
  { label: "Backup & Restore", icon: "fas fa-database", href: "/backups", type: "admin" },
  
  // Reports menu items
  { label: "Reports", icon: "fas fa-chart-bar", href: "/reports", type: "reports" },
  { label: "Tithe Reports", icon: "fas fa-church", href: "/financials/tithes/reports", type: "reports" },
  { label: "Income Reports", icon: "fas fa-chart-line", href: "/reports/income", type: "reports" },
  { label: "Expenses Report", icon: "fas fa-file-invoice-dollar", href: "/reports/expenses", type: "reports" },
  { label: "Income vs Expenses Report", icon: "fas fa-balance-scale", href: "/reports/income-vs-expenses", type: "reports" },
  { label: "Export Report", icon: "fas fa-file-excel", href: "/reports/export", type: "reports" },
];

// Helper function to get menu items by type
const getMenuItemsByType = (type: string) => {
  return allMenuItems.filter(item => item.type === type);
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

          {/* Import/Export Menu Section */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => toggleSubmenu('import')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                pathname.startsWith('/import-export')
                  ? "text-white bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20"
                  : "text-blue-100 hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-sm hover:text-white hover:shadow-lg"
              }`}
            >
              <div className="flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i className="fas fa-upload mr-4 text-lg group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                <span className="relative z-10">Import/Export</span>
              </div>
              <i className={`fas fa-chevron-down transition-transform duration-300 relative z-10 ${openSubmenu === 'import' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Import/Export Submenu */}
            {openSubmenu === 'import' && (
              <div className="ml-4 mt-2 space-y-2">
                {getMenuItemsByType("import").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                        isActive
                          ? "text-white bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm border border-white/15"
                          : "text-blue-100 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:backdrop-blur-sm hover:text-white hover:shadow-md"
                      }`}
                      onClick={handleNavClick}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/15 to-yellow-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <i className={`${item.icon} mr-3 text-sm group-hover:scale-110 transition-transform duration-300 relative z-10`}></i>
                      <span className="relative z-10 text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Financials Menu Section */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => toggleSubmenu('financials')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                pathname.startsWith('/financials')
                  ? "text-white bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20"
                  : "text-blue-100 hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-sm hover:text-white hover:shadow-lg"
              }`}
            >
              <div className="flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i className="fas fa-wallet mr-4 text-lg group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                <span className="relative z-10">Financials</span>
              </div>
              <i className={`fas fa-chevron-down transition-transform duration-300 relative z-10 ${openSubmenu === 'financials' ? 'rotate-180' : ''}`}></i>
            </button>
            {/* Financials Submenu */}
            {openSubmenu === 'financials' && (
              <div className="ml-4 mt-2 space-y-2">
                {getMenuItemsByType("financials").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                        isActive
                          ? "text-white bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm border border-white/15"
                          : "text-blue-100 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:backdrop-blur-sm hover:text-white hover:shadow-md"
                      }`}
                      onClick={handleNavClick}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/15 to-blue-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <i className={`${item.icon} mr-3 text-sm group-hover:scale-110 transition-transform duration-300 relative z-10`}></i>
                      <span className="relative z-10 text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>



          {/* Events Menu Section */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => toggleSubmenu('events')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                pathname.startsWith('/events') || pathname.startsWith('/event-categories')
                  ? "text-white bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20"
                  : "text-blue-100 hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-sm hover:text-white hover:shadow-lg"
              }`}
            >
              <div className="flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i className="fas fa-calendar-alt mr-4 text-lg group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                <span className="relative z-10">Events</span>
              </div>
              <i className={`fas fa-chevron-down transition-transform duration-300 relative z-10 ${openSubmenu === 'events' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Events Submenu */}
            {openSubmenu === 'events' && (
              <div className="ml-4 mt-2 space-y-2">
                {getMenuItemsByType("events").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                        isActive
                          ? "text-white bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm border border-white/15"
                          : "text-blue-100 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:backdrop-blur-sm hover:text-white hover:shadow-md"
                      }`}
                      onClick={handleNavClick}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <i className={`${item.icon} mr-3 text-sm group-hover:scale-110 transition-transform duration-300 relative z-10`}></i>
                      <span className="relative z-10 text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Attendance Menu Section */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => toggleSubmenu('attendance')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                pathname.startsWith('/attendance')
                  ? "text-white bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20"
                  : "text-blue-100 hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-sm hover:text-white hover:shadow-lg"
              }`}
            >
              <div className="flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i className="fas fa-clipboard-check mr-4 text-lg group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                <span className="relative z-10">Attendance</span>
              </div>
              <i className={`fas fa-chevron-down transition-transform duration-300 relative z-10 ${openSubmenu === 'attendance' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Attendance Submenu */}
            {openSubmenu === 'attendance' && (
              <div className="ml-4 mt-2 space-y-2">
                {getMenuItemsByType("attendance").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                        isActive
                          ? "text-white bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm border border-white/15"
                          : "text-blue-100 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:backdrop-blur-sm hover:text-white hover:shadow-md"
                      }`}
                      onClick={handleNavClick}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <i className={`${item.icon} mr-3 text-sm group-hover:scale-110 transition-transform duration-300 relative z-10`}></i>
                      <span className="relative z-10 text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings Menu Section */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => toggleSubmenu('settings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                pathname.startsWith('/settings')
                  ? "text-white bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20"
                  : "text-blue-100 hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-sm hover:text-white hover:shadow-lg"
              }`}
            >
              <div className="flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i className="fas fa-cog mr-4 text-lg group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                <span className="relative z-10">Settings</span>
              </div>
              <i className={`fas fa-chevron-down transition-transform duration-300 relative z-10 ${openSubmenu === 'settings' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Settings Submenu */}
            {openSubmenu === 'settings' && (
              <div className="ml-4 mt-2 space-y-2">
                {getMenuItemsByType("settings").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                        isActive
                          ? "text-white bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm border border-white/15"
                          : "text-blue-100 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:backdrop-blur-sm hover:text-white hover:shadow-md"
                      }`}
                      onClick={handleNavClick}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <i className={`${item.icon} mr-3 text-sm group-hover:scale-110 transition-transform duration-300 relative z-10`}></i>
                      <span className="relative z-10 text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>



          {/* Admin Menu Section */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => toggleSubmenu('admin')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                pathname.startsWith('/admin')
                  ? "text-white bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20"
                  : "text-blue-100 hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-sm hover:text-white hover:shadow-lg"
              }`}
            >
              <div className="flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i className="fas fa-user-shield mr-4 text-lg group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                <span className="relative z-10">Admin</span>
              </div>
              <i className={`fas fa-chevron-down transition-transform duration-300 relative z-10 ${openSubmenu === 'admin' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Admin Submenu */}
            {openSubmenu === 'admin' && (
              <div className="ml-4 mt-2 space-y-2">
                {getMenuItemsByType("admin").map((item) => {
                  const isActive = pathname === item.href;
                  const isBackup = item.href === '/backups';
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                        isActive
                          ? "text-white bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm border border-white/15"
                          : "text-blue-100 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:backdrop-blur-sm hover:text-white hover:shadow-md"
                      }`}
                      onClick={handleNavClick}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <i className={`${item.icon} mr-3 text-sm group-hover:scale-110 transition-transform duration-300 relative z-10`}></i>
                      <span className="relative z-10 text-sm">{item.label}</span>
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

          {/* Main Financial Reports Menu Section */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => toggleSubmenu('reports')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                pathname.startsWith('/reports')
                  ? "text-white bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20"
                  : "text-blue-100 hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-sm hover:text-white hover:shadow-lg"
              }`}
            >
              <div className="flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i className="fas fa-chart-bar mr-4 text-lg group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
                <span className="relative z-10">Reports</span>
              </div>
              <i className={`fas fa-chevron-down transition-transform duration-300 relative z-10 ${openSubmenu === 'reports' ? 'rotate-180' : ''}`}></i>
            </button>
            {openSubmenu === 'reports' && (
              <div className="ml-4 mt-2 space-y-2">
                {getMenuItemsByType("reports").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                        isActive
                          ? "text-white bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm border border-white/15"
                          : "text-blue-100 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:backdrop-blur-sm hover:text-white hover:shadow-md"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/15 to-blue-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <i className={`${item.icon} mr-3 text-sm group-hover:scale-110 transition-transform duration-300 relative z-10`}></i>
                      <span className="relative z-10 text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
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