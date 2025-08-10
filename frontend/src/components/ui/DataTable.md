# Enhanced DataTable Component

A comprehensive, reusable data table component with advanced features including pagination, filtering, sorting, and responsive design.

## Features

- ✅ **Pagination**: Full pagination with page navigation and page size selection
- ✅ **Filtering**: Advanced filtering system with multiple input types
- ✅ **Sorting**: Column-based sorting with visual indicators
- ✅ **Responsive**: Mobile-friendly table design
- ✅ **Loading States**: Built-in loading and empty state handling
- ✅ **Customizable**: Flexible column rendering and styling options
- ✅ **Dark Mode**: Full dark mode support
- ✅ **TypeScript**: Fully typed with generic support

## Basic Usage

```tsx
import { DataTable, type Column } from '@/components/ui';

interface User {
  id: number;
  name: string;
  email: string;
  status: string;
}

const columns: Column<User>[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' }
];

const data: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' }
];

function MyComponent() {
  return (
    <DataTable
      columns={columns}
      data={data}
    />
  );
}
```

## Advanced Usage with All Features

```tsx
import { DataTable, type Column, type Filter, type SortConfig } from '@/components/ui';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: string;
  joinDate: string;
}

const columns: Column<User>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center">
        <Avatar fallback={row.name} />
        <span className="ml-2">{row.name}</span>
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
    key: 'actions',
    label: 'Actions',
    render: (_, row) => (
      <div className="flex space-x-2">
        <Button size="sm">Edit</Button>
        <Button size="sm" variant="destructive">Delete</Button>
      </div>
    )
  }
];

const filters: Filter[] = [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search users...'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: '', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  }
];

function AdvancedTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState({});

  return (
    <DataTable
      columns={columns}
      data={users}
      filters={filters}
      pagination={{
        currentPage,
        totalPages: Math.ceil(totalUsers / perPage),
        totalItems: totalUsers,
        perPage,
        onPageChange: setCurrentPage,
        onPerPageChange: setPerPage
      }}
      sorting={{
        sortConfig,
        onSort: (key) => {
          setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
          }));
        }
      }}
      onFiltersChange={setFilters}
      loading={isLoading}
      perPageOptions={[10, 25, 50, 100]}
    />
  );
}
```

## Props

### DataTableProps<T>

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `columns` | `Column<T>[]` | ✅ | - | Array of column definitions |
| `data` | `T[]` | ✅ | - | Array of data to display |
| `filters` | `Filter[]` | ❌ | `[]` | Array of filter definitions |
| `pagination` | `PaginationConfig` | ❌ | - | Pagination configuration |
| `sorting` | `SortingConfig` | ❌ | - | Sorting configuration |
| `onFiltersChange` | `(filters: Record<string, any>) => void` | ❌ | - | Callback when filters change |
| `className` | `string` | ❌ | `""` | Additional CSS classes |
| `loading` | `boolean` | ❌ | `false` | Show loading state |
| `emptyMessage` | `string` | ❌ | `"No data available"` | Message when no data |
| `perPageOptions` | `number[]` | ❌ | `[10, 25, 50, 100]` | Available page sizes |
| `showPerPageSelector` | `boolean` | ❌ | `true` | Show page size selector |
| `showPagination` | `boolean` | ❌ | `true` | Show pagination controls |
| `responsive` | `boolean` | ❌ | `true` | Enable responsive behavior |

## Column Configuration

### Column<T>

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | `string` | ✅ | Unique identifier for the column |
| `label` | `string` | ✅ | Display label for the column header |
| `sortable` | `boolean` | ❌ | Whether the column can be sorted |
| `render` | `(value: any, row: T) => ReactNode` | ❌ | Custom render function for cell content |
| `width` | `string` | ❌ | CSS width (e.g., "200px", "20%") |
| `className` | `string` | ❌ | Additional CSS classes for the column |

## Filter Configuration

### Filter

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | `string` | ✅ | Unique identifier for the filter |
| `label` | `string` | ✅ | Display label for the filter |
| `type` | `'text' \| 'select' \| 'date' \| 'boolean'` | ✅ | Input type for the filter |
| `options` | `Array<{value: any, label: string}>` | ❌ | Options for select/boolean filters |
| `placeholder` | `string` | ❌ | Placeholder text for text inputs |

## Pagination Configuration

### PaginationConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `currentPage` | `number` | ✅ | Current active page |
| `totalPages` | `number` | ✅ | Total number of pages |
| `totalItems` | `number` | ✅ | Total number of items |
| `perPage` | `number` | ✅ | Items per page |
| `onPageChange` | `(page: number) => void` | ✅ | Callback when page changes |
| `onPerPageChange` | `(perPage: number) => void` | ✅ | Callback when page size changes |

## Sorting Configuration

### SortingConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `sortConfig` | `SortConfig \| null` | ✅ | Current sort configuration |
| `onSort` | `(key: string) => void` | ✅ | Callback when sorting changes |

### SortConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | `string` | ✅ | Column key being sorted |
| `direction` | `'asc' \| 'desc'` | ✅ | Sort direction |

## Filter Types

### Text Filter
```tsx
{
  key: 'search',
  label: 'Search',
  type: 'text',
  placeholder: 'Enter search term...'
}
```

### Select Filter
```tsx
{
  key: 'status',
  label: 'Status',
  type: 'select',
  options: [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]
}
```

### Date Filter
```tsx
{
  key: 'date',
  label: 'Date',
  type: 'date'
}
```

### Boolean Filter
```tsx
{
  key: 'isActive',
  label: 'Active',
  type: 'boolean'
}
```

## Custom Column Rendering

```tsx
const columns: Column<User>[] = [
  {
    key: 'avatar',
    label: 'User',
    render: (_, row) => (
      <div className="flex items-center">
        <img 
          src={row.avatar} 
          alt={row.name}
          className="w-8 h-8 rounded-full"
        />
        <span className="ml-2">{row.name}</span>
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    render: (_, row) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        row.status === 'active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {row.status}
      </span>
    )
  }
];
```

## Responsive Behavior

The table automatically handles responsive behavior:

- Horizontal scrolling on small screens
- Responsive filter layout
- Mobile-friendly pagination controls
- Flexible column widths

## Dark Mode Support

The component automatically adapts to dark mode using Tailwind's dark: variants:

- Dark backgrounds and borders
- Dark text colors
- Dark hover states
- Consistent with your app's theme

## Performance Considerations

- Use `useMemo` for expensive column render functions
- Implement proper loading states for large datasets
- Consider virtual scrolling for very large datasets
- Debounce filter inputs for better performance

## Integration with Backend

The component is designed to work seamlessly with backend APIs:

```tsx
// Example API integration
const loadUsers = async (filters: any, page: number, perPage: number, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
  const params = new URLSearchParams();
  
  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  
  // Add pagination
  params.append('page', String(page));
  params.append('per_page', String(perPage));
  
  // Add sorting
  if (sortBy) params.append('sort_by', sortBy);
  if (sortOrder) params.append('sort_order', sortOrder);
  
  const response = await fetch(`/api/users?${params.toString()}`);
  return response.json();
};
```

## Examples

See `DataTableDemo.tsx` for a complete working example with all features enabled. 