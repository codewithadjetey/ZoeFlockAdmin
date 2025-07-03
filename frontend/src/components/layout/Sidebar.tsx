import React from "react";
import { Home, Users, Calendar, BarChart2, HandCoins, Settings } from "lucide-react";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", icon: <Home size={20} />, href: "/dashboard" },
  { label: "Members", icon: <Users size={20} />, href: "/dashboard/members" },
  { label: "Events", icon: <Calendar size={20} />, href: "/dashboard/events" },
  { label: "Attendance", icon: <BarChart2 size={20} />, href: "/dashboard/attendance" },
  { label: "Donations", icon: <HandCoins size={20} />, href: "/dashboard/donations" },
  { label: "Settings", icon: <Settings size={20} />, href: "/dashboard/settings" },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-white border-r border-neutral-200 w-16 md:w-64 flex flex-col transition-all duration-200">
      <div className="flex flex-col gap-2 py-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 text-neutral-700 hover:text-primary-600 transition-colors group"
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="hidden md:inline ml-2">{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar; 