import { useState, useEffect } from 'react';
import { backupService, BackupStats } from '@/services/backups';

export const useBackupStats = () => {
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await backupService.getStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch backup stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const hasPendingBackups = stats?.pending && stats.pending > 0;
  const hasFailedBackups = stats?.failed && stats.failed > 0;

  return {
    stats,
    loading,
    error,
    hasPendingBackups,
    hasFailedBackups,
    refetch: fetchStats,
  };
}; 