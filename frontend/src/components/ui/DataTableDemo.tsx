import React, { useState, useEffect } from 'react';
import { DataTable, type Column, type Filter, type SortConfig, Button, StatusBadge, Avatar } from './index';

// Sample data interface
interface SampleData {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  joinDate: string;
  lastLogin: string;
}

// Sample data
const sampleData: SampleData[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active',
    role: 'Admin',
    joinDate: '2023-01-15',
    lastLogin: '2024-01-20'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'active',
    role: 'User',
    joinDate: '2023-02-20',
    lastLogin: '2024-01-19'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    status: 'inactive',
    role: 'User',
    joinDate: '2023-03-10',
    lastLogin: '2023-12-15'
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    status: 'pending',
    role: 'Moderator',
    joinDate: '2023-04-05',
    lastLogin: '2024-01-18'
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    status: 'active',
    role: 'User',
    joinDate: '2023-05-12',
    lastLogin: '2024-01-21'
  }
];

const DataTableDemo: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Simulate API call with filters and pagination
  const [data, setData] = useState<SampleData[]>(sampleData);
  const [totalItems, setTotalItems] = useState(sampleData.length);

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / perPage);

  // Apply filters and sorting to data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      let filteredData = [...sampleData];

      // Apply filters
      if (filters.status && filters.status !== '') {
        filteredData = filteredData.filter(item => item.status === filters.status);
      }
      if (filters.role && filters.role !== '') {
        filteredData = filteredData.filter(item => item.role === filters.role);
      }
      if (filters.search && filters.search !== '') {
        filteredData = filteredData.filter(item => 
          item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.email.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // Apply sorting
      if (sortConfig) {
        filteredData.sort((a, b) => {
          const aValue = a[sortConfig.key as keyof SampleData];
          const bValue = b[sortConfig.key as keyof SampleData];
          
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      setTotalItems(filteredData.length);
      setData(filteredData);
      setLoading(false);
    }, 500);
  }, [filters, sortConfig]);

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when per page changes
  };

  // Column definitions
  const columns: Column<SampleData>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center">
          <Avatar 
            fallback={row.name}
            size="sm"
            className="mr-3"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{row.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status} />
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (_, row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {row.role}
        </span>
      )
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      sortable: true,
      render: (_, row) => new Date(row.joinDate).toLocaleDateString()
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      render: (_, row) => new Date(row.lastLogin).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="danger">Delete</Button>
        </div>
      )
    }
  ];

  // Filter definitions
  const tableFilters: Filter[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search by name or email...'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: '', label: 'All Roles' },
        { value: 'Admin', label: 'Admin' },
        { value: 'Moderator', label: 'Moderator' },
        { value: 'User', label: 'User' }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Enhanced DataTable Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          A comprehensive, reusable data table component with pagination, filtering, and sorting
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Features Showcase
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          <li>✅ Pagination with page navigation</li>
          <li>✅ Page size selection (10, 25, 50, 100)</li>
          <li>✅ Responsive table design</li>
          <li>✅ Column sorting (click headers)</li>
          <li>✅ Advanced filtering system</li>
          <li>✅ Loading states</li>
          <li>✅ Empty state handling</li>
          <li>✅ Custom column rendering</li>
          <li>✅ Dark mode support</li>
        </ul>
      </div>

      <DataTable
        columns={columns}
        data={data}
        filters={tableFilters}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          perPage,
          onPageChange: handlePageChange,
          onPerPageChange: handlePerPageChange
        }}
        sorting={{
          sortConfig,
          onSort: handleSort
        }}
        onFiltersChange={handleFiltersChange}
        loading={loading}
        emptyMessage="No users found matching your criteria"
        perPageOptions={[5, 10, 25, 50]}
        showPerPageSelector={true}
        showPagination={true}
        responsive={true}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Current State
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Current Page:</span> {currentPage}
          </div>
          <div>
            <span className="font-medium">Per Page:</span> {perPage}
          </div>
          <div>
            <span className="font-medium">Total Items:</span> {totalItems}
          </div>
          <div>
            <span className="font-medium">Sort:</span> {sortConfig ? `${sortConfig.key} (${sortConfig.direction})` : 'None'}
          </div>
        </div>
        <div className="mt-3">
          <span className="font-medium">Active Filters:</span>
          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DataTableDemo; 