# DataTable Migration Guide

This guide explains how to migrate from the old DataTable component to the new enhanced version with pagination, filtering, and sorting capabilities.

## What's New

The enhanced DataTable component now includes:
- ✅ **Pagination**: Full pagination with page navigation and page size selection
- ✅ **Filtering**: Advanced filtering system with multiple input types
- ✅ **Sorting**: Column-based sorting with visual indicators
- ✅ **Loading States**: Built-in loading and empty state handling
- ✅ **Responsive Design**: Mobile-friendly table design
- ✅ **TypeScript Support**: Fully typed with generic support

## Migration Steps

### 1. Update Import Statements

**Before:**
```tsx
import { DataTable } from '@/components/ui';
```

**After:**
```tsx
import { DataTable, type Column, type Filter, type SortConfig } from '@/components/ui';
```

### 2. Update Column Definitions

**Before:**
```tsx
const tableColumns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { 
    key: "status", 
    label: "Status", 
    render: (_, row) => <StatusBadge status={row.status} /> 
  }
];
```

**After:**
```tsx
const tableColumns: Column<Member>[] = [
  { 
    key: "name", 
    label: "Name",
    sortable: true // Enable sorting for this column
  },
  { 
    key: "email", 
    label: "Email",
    sortable: true
  },
  { 
    key: "status", 
    label: "Status",
    sortable: true,
    render: (_, row) => <StatusBadge status={row.status} /> 
  }
];
```

### 3. Add State Management for New Features

**Before:**
```tsx
const [members, setMembers] = useState<Member[]>([]);
const [page, setPage] = useState<number>(1);
const [perPage, setPerPage] = useState<number>(10);
```

**After:**
```tsx
const [members, setMembers] = useState<Member[]>([]);
const [currentPage, setCurrentPage] = useState<number>(1);
const [perPage, setPerPage] = useState<number>(10);
const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
const [filters, setFilters] = useState<Record<string, any>>({});
const [loading, setLoading] = useState(false);
```

### 4. Update API Calls

**Before:**
```tsx
const loadMembers = async () => {
  try {
    const response = await MembersService.getMembers({
      search: searchTerm || undefined,
      status: statusFilter === "All Status" ? undefined : statusFilter,
      page,
      per_page: perPage,
    });
    if (response.success) {
      setMembers(response.members.data);
      setTotal(response.members.total);
      setLinks(response.members.links || []);
    }
  } catch (err) {
    toast.error('Failed to load members');
  }
};
```

**After:**
```tsx
const loadMembers = async () => {
  setLoading(true);
  try {
    const response = await MembersService.getMembers({
      search: filters.search || undefined,
      status: filters.status || undefined,
      sort_by: sortConfig?.key,
      sort_order: sortConfig?.direction,
      page: currentPage,
      per_page: perPage,
    });
    if (response.success) {
      setMembers(response.members.data);
      setTotal(response.members.total);
    }
  } catch (err) {
    toast.error('Failed to load members');
  } finally {
    setLoading(false);
  }
};
```

### 5. Add Filter Definitions

**Before:**
```tsx
// Filters were handled separately with individual state variables
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("All Status");
```

**After:**
```tsx
const tableFilters: Filter[] = [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search members...'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: '', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  }
];
```

### 6. Update DataTable Usage

**Before:**
```tsx
<DataTable columns={tableColumns} data={members} />
```

**After:**
```tsx
<DataTable
  columns={tableColumns}
  data={members}
  filters={tableFilters}
  pagination={{
    currentPage,
    totalPages: Math.ceil(total / perPage),
    totalItems: total,
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
  loading={loading}
  emptyMessage="No members found matching your criteria"
  perPageOptions={[10, 25, 50, 100]}
/>
```

### 7. Remove Old Pagination Code

**Before:**
```tsx
<div className="mt-6 flex items-center justify-center space-x-2">
  <button
    className={`px-3 py-1 rounded ${prevLink?.url ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
    disabled={!prevLink?.url}
    onClick={() => followLink(prevLink?.url || null)}
  >
    « Prev
  </button>
  {/* ... more pagination buttons ... */}
</div>
```

**After:**
```tsx
// Remove this entire pagination section - it's now handled by the DataTable component
```

### 8. Update useEffect Dependencies

**Before:**
```tsx
useEffect(() => {
  loadMembers();
}, [page, perPage]);

useEffect(() => {
  setPage(1);
  loadMembers();
}, [searchTerm, statusFilter]);
```

**After:**
```tsx
useEffect(() => {
  loadMembers();
}, [currentPage, perPage, sortConfig, filters]);
```

## Complete Migration Example

Here's a complete example of migrating a members page:

### Before Migration
```tsx
export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [total, setTotal] = useState<number>(0);
  const [links, setLinks] = useState<any[]>([]);

  const tableColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" }
  ];

  return (
    <div>
      <SearchInput
        placeholder="Search members..."
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <SelectInput
        value={statusFilter}
        onChange={setStatusFilter}
        options={statusOptions}
      />
      
      <DataTable columns={tableColumns} data={members} />
      
      {/* Old pagination code */}
      <div className="pagination">
        {/* ... pagination buttons ... */}
      </div>
    </div>
  );
}
```

### After Migration
```tsx
export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number>(0);

  const tableColumns: Column<Member>[] = [
    { 
      key: "name", 
      label: "Name",
      sortable: true
    },
    { 
      key: "email", 
      label: "Email",
      sortable: true
    },
    { 
      key: "status", 
      label: "Status",
      sortable: true
    }
  ];

  const tableFilters: Filter[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search members...'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ];

  return (
    <div>
      <DataTable
        columns={tableColumns}
        data={members}
        filters={tableFilters}
        pagination={{
          currentPage,
          totalPages: Math.ceil(total / perPage),
          totalItems: total,
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
        loading={loading}
        emptyMessage="No members found matching your criteria"
      />
    </div>
  );
}
```

## Benefits of Migration

1. **Cleaner Code**: No more manual pagination, filtering, or sorting logic
2. **Better UX**: Built-in loading states, empty states, and responsive design
3. **Consistent UI**: All tables will have the same look and feel
4. **Type Safety**: Full TypeScript support with generic types
5. **Maintainability**: Centralized table logic in one component
6. **Performance**: Optimized rendering and state management

## Backward Compatibility

The enhanced DataTable component maintains backward compatibility. You can still use it with just the basic props:

```tsx
<DataTable columns={columns} data={data} />
```

All new features are optional and can be added incrementally.

## Testing the Migration

1. Start with a simple table and add features one by one
2. Test pagination, filtering, and sorting individually
3. Verify that the API calls include the new parameters
4. Check that the UI updates correctly with the new state
5. Test responsive behavior on different screen sizes

## Need Help?

If you encounter any issues during migration:
1. Check the console for TypeScript errors
2. Verify that all required props are provided
3. Ensure your API endpoints support the new parameters
4. Refer to the `DataTable.md` documentation for detailed API reference 