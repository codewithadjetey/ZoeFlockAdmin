import React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  actionButton?: {
    text: string;
    icon: string;
    onClick: () => void;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actionButton }) => {
  return (
    <section className="mb-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>
          {actionButton && (
            <button 
              onClick={actionButton.onClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center mt-4 md:mt-0"
            >
              <i className={`${actionButton.icon} mr-2`}></i>
              {actionButton.text}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHeader; 