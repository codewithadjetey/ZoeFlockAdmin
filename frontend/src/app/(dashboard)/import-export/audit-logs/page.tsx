'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Input, SelectInput, DataTable, Alert } from '@/components/ui';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { api } from '@/utils/api';

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  model_type: string;
  model_id: number;
  description: string;
  details: any;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'error' | 'warning';
  error_message: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    model_type: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/import/audit-logs?${params.toString()}`);
      setLogs(response.data.data.data || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      showToast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/import-export');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getModelTypeLabel = (modelType: string) => {
    const labels: { [key: string]: string } = {
      'App\\Models\\Member': 'Member',
      'App\\Models\\Family': 'Family',
      'App\\Models\\Group': 'Group',
      'App\\Models\\EventCategory': 'Event Category',
      'App\\Models\\PartnershipCategory': 'Partnership Category',
      'App\\Models\\IncomeCategory': 'Income Category',
      'App\\Models\\ExpenseCategory': 'Expense Category',
    };
    return labels[modelType] || modelType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Import Options
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Audit Logs
          </CardTitle>
          <CardDescription>
            Track all import activities and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Model Type</label>
                <Select value={filters.model_type} onValueChange={(value) => setFilters(prev => ({ ...prev, model_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="App\\Models\\Member">Members</SelectItem>
                    <SelectItem value="App\\Models\\Family">Families</SelectItem>
                    <SelectItem value="App\\Models\\Group">Groups</SelectItem>
                    <SelectItem value="App\\Models\\EventCategory">Event Categories</SelectItem>
                    <SelectItem value="App\\Models\\PartnershipCategory">Partnership Categories</SelectItem>
                    <SelectItem value="App\\Models\\IncomeCategory">Income Categories</SelectItem>
                    <SelectItem value="App\\Models\\ExpenseCategory">Expense Categories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search descriptions..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            {logs.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No audit logs found matching your criteria.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.user ? (
                            <div>
                              <div className="font-medium">{log.user.name}</div>
                              <div className="text-xs text-gray-500">{log.user.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">System</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {getModelTypeLabel(log.model_type)}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {log.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            {getStatusBadge(log.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.details && (
                            <div className="text-xs text-gray-500">
                              {log.details.row_number && `Row: ${log.details.row_number}`}
                              {log.details.phone && `Phone: ${log.details.phone}`}
                              {log.details.email && `Email: ${log.details.email}`}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 