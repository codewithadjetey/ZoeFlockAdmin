import React from "react";
import { Bell, UserCircle } from "lucide-react";

const Topbar: React.FC = () => {
  return (
    <header className="bg-white border-b border-neutral-200 px-4 md:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-primary-600 font-bold text-lg">ZoeFlockAdmin</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
        </button>
        <div className="flex items-center gap-2">
          <UserCircle size={32} className="text-primary-500" />
          <span className="hidden md:inline text-neutral-900 font-medium">John Doe</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar; 