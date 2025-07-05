import React from "react";

interface DataGridProps {
  data: any[];
  renderCard: (item: any) => React.ReactNode;
  columns?: number;
  className?: string;
}

const DataGrid: React.FC<DataGridProps> = ({ 
  data, 
  renderCard, 
  columns = 4,
  className = "" 
}) => {
  const getGridCols = (cols: number) => {
    switch (cols) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case 5: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
      case 6: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  return (
    <section className={`grid ${getGridCols(columns)} gap-6 ${className}`}>
      {data.map((item, index) => (
        <div key={index}>
          {renderCard(item)}
        </div>
      ))}
    </section>
  );
};

export default DataGrid; 