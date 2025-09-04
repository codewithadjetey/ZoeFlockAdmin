'use client';

import { useState, useEffect } from 'react';
import { Button, DataTable, SearchInput, Alert, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { FormField } from '@/components/ui';
import { SelectInput } from '@/components/ui';
import { TextArea } from '@/components/ui';
import { Modal } from '@/components/ui';
import { toast } from 'react-toastify';
import { backupService, Backup, BackupStats, CreateBackupRequest } from '@/services/backups';
import { Download, Upload, Trash2, RefreshCw, Database, HardDrive, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateBackupRequest>({
    type: 'database',
    notes: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBackups();
    fetchStats();
  }, [currentPage, searchTerm, selectedStatus, selectedType]);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedType && { type: selectedType }),
      });

      const response = await backupService.getBackups({
        page: currentPage,
        per_page: perPage,
        status: selectedStatus || undefined,
        type: selectedType || undefined,
      });

      if (response.success) {
        setBackups(response.data);
        setTotalPages(response.pagination.last_page);
      }
    } catch (error) {
      toast.error('Error fetching backups');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await backupService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const response = await backupService.createBackup(createForm);
      
      if (response.success) {
        toast.success('Backup request created successfully');
        setCreateModalOpen(false);
        setCreateForm({ type: 'database', notes: '' });
        fetchBackups();
        fetchStats();
      } else {
        toast.error(response.message || 'Failed to create backup');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleProcessBackups = async () => {
    try {
      setProcessing(true);
      const response = await backupService.processBackups();
      
      if (response.success) {
        toast.success(`Processed ${response.data.processed} backups (${response.data.success} success, ${response.data.failed} failed)`);
        fetchBackups();
        fetchStats();
      } else {
        toast.error(response.message || 'Failed to process backups');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process backups');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      const response = await backupService.downloadBackup(backup.id);
      
      if (response.success) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = response.data.download_url;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Download started');
      } else {
        toast.error('Failed to download backup');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download backup');
    }
  };

  const handleRestoreBackup = async (backup: Backup) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite the current database.')) {
      return;
    }

    try {
      const response = await backupService.restoreBackup(backup.id);
      
      if (response.success) {
        toast.success('Backup restored successfully');
      } else {
        toast.error(response.message || 'Failed to restore backup');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to restore backup');
    }
  };

  const handleDeleteBackup = async (backup: Backup) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      const response = await backupService.deleteBackup(backup.id);
      
      if (response.success) {
        toast.success('Backup deleted successfully');
        fetchBackups();
        fetchStats();
      } else {
        toast.error(response.message || 'Failed to delete backup');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete backup');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'full':
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns = [
    {
      key: 'filename',
      label: 'Filename',
      render: (value: any, row: Backup) => (
        <div className="font-mono text-sm">
          {row.filename}
        </div>
      ),
    },
    {
      key: 'backup_type',
      label: 'Type',
      render: (value: any, row: Backup) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(row.backup_type)}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.backup_type === 'database' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {row.backup_type === 'database' ? 'Database' : 'Full System'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: Backup) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.status)}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === 'completed' ? 'bg-green-100 text-green-800' :
            row.status === 'failed' ? 'bg-red-100 text-red-800' :
            row.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {row.status_label}
          </span>
        </div>
      ),
    },
    {
      key: 'file_size',
      label: 'Size',
      render: (value: any, row: Backup) => (
        <span className="text-sm text-gray-600">
          {row.file_size ? row.file_size_formatted : '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: any, row: Backup) => (
        <span className="text-sm text-gray-600">
          {format(new Date(row.created_at), 'MMM dd, yyyy HH:mm')}
        </span>
      ),
    },
    {
      key: 'creator',
      label: 'Creator',
      render: (value: any, row: Backup) => (
        <span className="text-sm text-gray-600">
          {row.creator?.name || 'System'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Backup) => (
        <div className="flex items-center space-x-2">
          {row.status === 'completed' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownloadBackup(row)}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRestoreBackup(row)}
              >
                <Upload className="h-4 w-4 mr-1" />
                Restore
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteBackup(row)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="welcome-gradient rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 font-['Poppins'] bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Backup Management
              </h1>
              <p className="text-blue-100 dark:text-blue-200 text-lg">
                Manage database backups and restorations with ease
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex space-x-4">
              <Button 
                onClick={() => toast.success('Test success message!')}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Test Toast
              </Button>
              <Button 
                onClick={handleProcessBackups} 
                disabled={processing}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {processing ? 'Processing...' : 'Process Backups'}
              </Button>
              <Button 
                onClick={() => setCreateModalOpen(true)}
                className="bg-white text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-200 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Upload className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="stat-card rounded-3xl shadow-xl p-6 flex items-center transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Backups</dt>
                <dd className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</dd>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Backups in system</p>
              </div>
            </div>
            
            <div className="stat-card rounded-3xl shadow-xl p-6 flex items-center transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completed</dt>
                <dd className="text-3xl font-bold text-green-600">{stats.completed}</dd>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Successful backups</p>
              </div>
            </div>
            
            <div className="stat-card rounded-3xl shadow-xl p-6 flex items-center transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pending</dt>
                <dd className="text-3xl font-bold text-yellow-600">{stats.pending}</dd>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Awaiting processing</p>
              </div>
            </div>
            
            <div className="stat-card rounded-3xl shadow-xl p-6 flex items-center transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Failed</dt>
                <dd className="text-3xl font-bold text-red-600">{stats.failed}</dd>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Failed backups</p>
              </div>
            </div>
            
            <div className="stat-card rounded-3xl shadow-xl p-6 flex items-center transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                <HardDrive className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Size</dt>
                <dd className="text-3xl font-bold text-gray-900 dark:text-white">{formatFileSize(stats.total_size)}</dd>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Storage used</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-['Poppins']">Filter Backups</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Search Backups
              </label>
              <SearchInput
                placeholder="Search by filename..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Filter by Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="database">Database</option>
                <option value="full">Full System</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('');
                  setSelectedType('');
                }}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
              >
                <i className="fas fa-times mr-2"></i>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

    
          <DataTable
            columns={columns}
            data={backups}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              totalItems: backups.length * totalPages, // Estimate total items
              perPage,
              onPageChange: setCurrentPage,
              onPerPageChange: () => {}, // Not implemented yet
            }}
          />

        {/* Create Backup Modal */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Backup"
          size="md"
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mr-4">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Backup Configuration</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Configure your backup settings</p>
                </div>
              </div>
            </div>
            
            <FormField label="Backup Type">
              <SelectInput
                value={createForm.type}
                onChange={(value) => setCreateForm({ ...createForm, type: value as 'database' | 'full' })}
                options={[
                  { value: 'database', label: 'Database Only' },
                  { value: 'full', label: 'Full System' },
                ]}
                placeholder="Select backup type"
              />
            </FormField>
            
            <FormField label="Notes (Optional)">
              <TextArea
                value={createForm.notes || ''}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                placeholder="Add any notes about this backup..."
                rows={3}
              />
            </FormField>
            
            <div className="flex justify-end gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="px-6 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBackup}
                disabled={creating}
                loading={creating}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {creating ? 'Creating...' : 'Create Backup'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
} 