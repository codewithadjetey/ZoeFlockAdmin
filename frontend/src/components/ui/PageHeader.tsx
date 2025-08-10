import React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  actionButton?: {
    text: string;
    icon: string;
    onClick: () => void;
  };
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actionButton, actions }) => {
  return (
    <section className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-['Poppins'] mb-2 transition-colors duration-200">{title}</h2>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{description}</p>
          </div>
          {actions ? (
            actions
          ) : actionButton ? (
            <button 
              onClick={actionButton.onClick}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center mt-4 md:mt-0 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <i className={`${actionButton.icon} mr-2`}></i>
              {actionButton.text}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default PageHeader; 