"use client";
import React, { useState } from "react";
import { Home, Users, Calendar, BarChart2, HandCoins, Settings, User, Lock, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: <Home size={20} />, href: "/dashboard" },
  { label: "Members", icon: <Users size={20} />, href: "/dashboard/members" },
  { label: "Events", icon: <Calendar size={20} />, href: "/dashboard/events" },
  { label: "Attendance", icon: <BarChart2 size={20} />, href: "/dashboard/attendance" },
  { label: "Donations", icon: <HandCoins size={20} />, href: "/dashboard/donations" },
  { label: "Settings", icon: <Settings size={20} />, href: "/dashboard/settings", children: [
    { label: "Profile", icon: <User size={20} />, href: "/dashboard/settings/profile" },
    { label: "Security", icon: <Lock size={20} />, href: "/dashboard/settings/security" },
    { label: "Notifications", icon: <Bell size={20} />, href: "/dashboard/settings/notifications" },
  ] },
];

const Sidebar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();

  const handleToggle = (label: string) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  return (
    <aside className="bg-white border-r border-neutral-200 w-16 md:w-64 flex flex-col transition-all duration-200">
      <div className="flex flex-col gap-2 py-4">
        {navItems.map((item) => (
          <div key={item.label} className="flex flex-col">
            {item.children ? (
              <>
                <button
                  type="button"
                  onClick={() => handleToggle(item.label)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 text-neutral-700 hover:text-primary-600 transition-colors group w-full text-left focus:outline-none"
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="hidden md:inline ml-2 flex-1">{item.label}</span>
                  <ChevronRight className={`ml-auto transition-transform duration-200 ${openMenu === item.label ? 'rotate-90' : ''}`} size={18} />
                </button>
                {openMenu === item.label && (
                  <div className="ml-8 flex flex-col gap-1 mt-1">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href;
                      return (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-primary-50 text-sm transition-colors
                            ${isActive ? 'bg-primary-100 text-primary-700 font-semibold' : 'text-neutral-600 hover:text-primary-600'}`}
                        >
                          <span className="flex-shrink-0">{child.icon}</span>
                          <span className="hidden md:inline ml-2">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 text-neutral-700 hover:text-primary-600 transition-colors group"
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="hidden md:inline ml-2">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar; 