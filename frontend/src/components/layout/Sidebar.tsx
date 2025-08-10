"use client";
import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

const navItems = [
  { label: "Dashboard", icon: "fas fa-home", href: "/dashboard" },
  { label: "Members", icon: "fas fa-users", href: "/members" },
  { label: "Families", icon: "fas fa-house-user", href: "/families" },
  { label: "Events", icon: "fas fa-calendar", href: "/events" },
  { label: "Groups", icon: "fas fa-layer-group", href: "/groups" },
  { label: "Donations", icon: "fas fa-donate", href: "/donations" },
  { label: "Communication", icon: "fas fa-envelope", href: "/communication" },
  { label: "Settings", icon: "fas fa-cog", href: "/settings" },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { currentTheme, colorMode } = useTheme();

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
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? "text-white bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20"
                    : "text-blue-100 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:backdrop-blur-sm"
                }`}
                onClick={handleNavClick}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i className={`${item.icon} mr-4 text-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}></i>
                <span className="relative z-10">{item.label}</span>
              </Link>
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