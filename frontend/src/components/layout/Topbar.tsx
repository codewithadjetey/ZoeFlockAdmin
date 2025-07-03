"use client";
import React, { useState, useRef } from "react";
import { Bell, UserCircle } from "lucide-react";

const Topbar: React.FC = () => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLButtonElement>(null);
  const userDropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const notifDropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        userRef.current &&
        !userRef.current.contains(e.target as Node) &&
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="bg-white border-b border-neutral-200 px-4 md:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-primary-600 font-bold text-lg">ZoeFlockAdmin</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            onMouseEnter={() => {
              if (notifDropdownTimeout.current) {
                clearTimeout(notifDropdownTimeout.current);
              }
              setNotifDropdownOpen(true);
            }}
            onMouseLeave={() => {
              notifDropdownTimeout.current = setTimeout(() => {
                setNotifDropdownOpen(false);
              }, 200);
            }}
            onClick={() => setNotifDropdownOpen((open) => !open)}
          >
            <button
              ref={notifRef}
              className="relative p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
              tabIndex={0}
              onFocus={() => setNotifDropdownOpen(true)}
              onBlur={() => setNotifDropdownOpen(false)}
              aria-haspopup="true"
              aria-expanded={notifDropdownOpen}
            >
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded shadow-lg z-20">
                <div className="p-3 text-sm text-neutral-700 font-medium border-b">Notifications</div>
                <ul className="max-h-60 overflow-y-auto">
                  <li className="px-4 py-2 hover:bg-neutral-100 cursor-pointer">New user registered</li>
                  <li className="px-4 py-2 hover:bg-neutral-100 cursor-pointer">Server restarted</li>
                  <li className="px-4 py-2 hover:bg-neutral-100 cursor-pointer">You have 3 new messages</li>
                </ul>
                <div className="p-2 text-xs text-center text-primary-600 hover:underline cursor-pointer">View all</div>
              </div>
            )}
          </div>
        </div>
        <div
          ref={userRef}
          className="relative cursor-pointer"
          onMouseEnter={() => {
            if (userDropdownTimeout.current) {
              clearTimeout(userDropdownTimeout.current);
            }
            setUserDropdownOpen(true);
          }}
          onMouseLeave={() => {
            userDropdownTimeout.current = setTimeout(() => {
              setUserDropdownOpen(false);
            }, 200); // 200ms delay
          }}
          onClick={() => setUserDropdownOpen((open) => !open)}
          tabIndex={0}
          onFocus={() => setUserDropdownOpen(true)}
          onBlur={() => setUserDropdownOpen(false)}
          aria-haspopup="true"
          aria-expanded={userDropdownOpen}
        >
          <div className="flex items-center gap-2">
            <UserCircle size={32} className="text-primary-500" />
            <span className="hidden md:inline text-neutral-900 font-medium">John Doe</span>
          </div>
          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-neutral-200 rounded shadow-lg z-20">
              <ul>
                <li className="px-4 py-2 hover:bg-neutral-100 cursor-pointer">Profile</li>
                <li className="px-4 py-2 hover:bg-neutral-100 cursor-pointer">Settings</li>
                <li className="px-4 py-2 hover:bg-neutral-100 cursor-pointer text-red-500">Logout</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar; 