import React from "react";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  className = "" 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 transition-all duration-300 ${className}`}>
      <nav className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 text-primary-700 dark:text-primary-400 font-medium shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <i className={`${tab.icon} mr-3 text-lg transition-colors duration-200`}></i>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation; 