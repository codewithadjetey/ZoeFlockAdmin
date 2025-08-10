import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable, { type Column, type Filter } from '../DataTable';

// Mock data
const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
];

const mockColumns: Column<typeof mockData[0]>[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
];

const mockFilters: Filter[] = [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search...'
  }
];

describe('DataTable', () => {
  it('renders basic table with data', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<DataTable columns={mockColumns} data={[]} />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    render(
      <DataTable 
        columns={mockColumns} 
        data={[]} 
        emptyMessage="No users found"
      />
    );
    
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <DataTable 
        columns={mockColumns} 
        data={[]} 
        loading={true}
      />
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders filters when provided', () => {
    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        filters={mockFilters}
      />
    );
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders pagination when provided', () => {
    const mockPagination = {
      currentPage: 1,
      totalPages: 3,
      totalItems: 25,
      perPage: 10,
      onPageChange: jest.fn(),
      onPerPageChange: jest.fn(),
    };

    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        pagination={mockPagination}
      />
    );
    
    expect(screen.getByText('Showing 1 to 10 of 25 results')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onPageChange when page button is clicked', () => {
    const mockOnPageChange = jest.fn();
    const mockPagination = {
      currentPage: 1,
      totalPages: 3,
      totalItems: 25,
      perPage: 10,
      onPageChange: mockOnPageChange,
      onPerPageChange: jest.fn(),
    };

    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        pagination={mockPagination}
      />
    );
    
    fireEvent.click(screen.getByText('2'));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPerPageChange when per page selector changes', () => {
    const mockOnPerPageChange = jest.fn();
    const mockPagination = {
      currentPage: 1,
      totalPages: 3,
      totalItems: 25,
      perPage: 10,
      onPageChange: jest.fn(),
      onPerPageChange: mockOnPerPageChange,
    };

    render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        pagination={mockPagination}
      />
    );
    
    const perPageSelect = screen.getByDisplayValue('10');
    fireEvent.change(perPageSelect, { target: { value: '25' } });
    expect(mockOnPerPageChange).toHaveBeenCalledWith(25);
  });

  it('renders custom column render function', () => {
    const customColumns: Column<typeof mockData[0]>[] = [
      {
        key: 'name',
        label: 'Name',
        render: (_, row) => <span data-testid={`name-${row.id}`}>{row.name}</span>
      },
      { key: 'email', label: 'Email' },
    ];

    render(<DataTable columns={customColumns} data={mockData} />);
    
    expect(screen.getByTestId('name-1')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('name-2')).toHaveTextContent('Jane Smith');
  });

  it('applies custom className', () => {
    const { container } = render(
      <DataTable 
        columns={mockColumns} 
        data={mockData} 
        className="custom-table"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-table');
  });
}); 