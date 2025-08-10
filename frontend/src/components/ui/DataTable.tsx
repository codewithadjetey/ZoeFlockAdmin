import React, { useState, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  className?: string;
}

export interface Filter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: { value: string | number | boolean; label: string }[];
  placeholder?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  filters?: Filter[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
  };
  sorting?: {
    sortConfig: SortConfig | null;
    onSort: (key: string) => void;
  };
  onFiltersChange?: (filters: Record<string, any>) => void;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  perPageOptions?: number[];
  showPerPageSelector?: boolean;
  showPagination?: boolean;
  responsive?: boolean;
}

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  filters = [],
  pagination,
  sorting,
  onFiltersChange,
  className = "",
  loading = false,
  emptyMessage = "No data available",
  perPageOptions = [10, 25, 50, 100],
  showPerPageSelector = true,
  showPagination = true,
  responsive = true
}: DataTableProps<T>) => {
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onFiltersChange?.({});
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  const renderFilterInput = (filter: Filter) => {
    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={filter.placeholder || `Filter ${filter.label}...`}
            value={localFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      case 'select':
        return (
          <select
            value={localFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All {filter.label}</option>
            {filter.options?.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            value={localFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      case 'boolean':
        return (
          <select
            value={localFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      default:
        return null;
    }
  };

  const renderPagination = () => {
    if (!pagination || !showPagination) return null;

    const { currentPage, totalPages, totalItems, perPage, onPageChange, onPerPageChange } = pagination;
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-4">
          {showPerPageSelector && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show:</span>
              <select
                value={perPage}
                onChange={(e) => onPerPageChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {perPageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
            </div>
          )}
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startItem} to {endItem} of {totalItems} results
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ChevronDoubleRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ${className}`}>
      {/* Filters Section */}
      {filters.length > 0 && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
            {filters.map((filter) => (
              <div key={filter.key} className="flex flex-col gap-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200 ${
                    column.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-300' : ''
                  } ${column.width ? column.width : ''} ${column.className || ''}`}
                  onClick={() => column.sortable && sorting?.onSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sorting?.sortConfig?.key === column.key && (
                      <span className="text-blue-600">
                        {sorting.sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300">
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className={`px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white transition-colors duration-200 ${
                        column.className || ''
                      }`}
                    >
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key] || '-'
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      {renderPagination()}
    </section>
  );
};

export default DataTable; 