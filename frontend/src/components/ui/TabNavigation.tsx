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
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <nav className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className={`${tab.icon} mr-3 text-lg`}></i>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation; 