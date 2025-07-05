"use client";
import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: "fas fa-home", href: "/dashboard" },
  { label: "Members", icon: "fas fa-users", href: "/dashboard/members" },
  { label: "Events", icon: "fas fa-calendar", href: "/dashboard/events" },
  { label: "Groups", icon: "fas fa-layer-group", href: "/dashboard/groups" },
  { label: "Donations", icon: "fas fa-donate", href: "/dashboard/donations" },
  { label: "Communication", icon: "fas fa-envelope", href: "/dashboard/communication" },
  { label: "Settings", icon: "fas fa-cog", href: "/dashboard/settings" },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

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
    window.location.href = "/auth/login";
  };

  const handleNavClick = () => {
    // Only close sidebar on mobile devices
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`sidebar-gradient w-64 h-screen flex flex-col border-r border-blue-800 transition-all duration-300 shadow-2xl z-40 ${
          isOpen ? "fixed translate-x-0" : "fixed lg:static -translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo/Brand Section */}
        <div className="flex items-center justify-center h-24 border-b border-blue-700 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 shadow-lg">
              <i className="fas fa-church text-2xl text-blue-600"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-['Poppins']">Zoe Flock</h1>
              <p className="text-xs text-blue-200">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 py-8 space-y-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                  isActive
                    ? "text-white bg-white bg-opacity-20"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-20"
                }`}
                onClick={handleNavClick}
              >
                <i className={`${item.icon} mr-4 text-lg group-hover:scale-110 transition-transform`}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-blue-700 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 group"
          >
            <i className="fas fa-sign-out-alt mr-3 group-hover:scale-110 transition-transform"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 mobile-overlay"
          onClick={() => onToggle()}
        ></div>
      )}
    </>
  );
};

export default Sidebar; 