import { api } from '@/utils/api';

export interface Backup {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
  file_size_formatted: string;
  backup_type: 'database' | 'full';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  status_label: string;
  created_by: number | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface BackupStats {
  total: number;
  completed: number;
  pending: number;
  in_progress: number;
  failed: number;
  total_size: number;
}

export interface CreateBackupRequest {
  type: 'database' | 'full';
  notes?: string;
}

export interface BackupListResponse {
  success: boolean;
  data: Backup[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface BackupResponse {
  success: boolean;
  data: Backup;
  message?: string;
}

export interface BackupStatsResponse {
  success: boolean;
  data: BackupStats;
}

export interface ProcessBackupResponse {
  success: boolean;
  message: string;
  data: {
    processed: number;
    success: number;
    failed: number;
    errors: string[];
  };
}

export interface DownloadBackupResponse {
  success: boolean;
  data: {
    download_url: string;
    filename: string;
    file_size: string;
  };
}

class BackupService {
  private baseUrl = '/backups';

  async getBackups(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    type?: string;
  }): Promise<BackupListResponse> {
    const response = await api.get(this.baseUrl, { params });
    return response.data;
  }

  async getBackup(id: number): Promise<BackupResponse> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createBackup(data: CreateBackupRequest): Promise<BackupResponse> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async downloadBackup(id: number): Promise<DownloadBackupResponse> {
    const response = await api.get(`${this.baseUrl}/${id}/download`);
    return response.data;
  }

  async restoreBackup(id: number): Promise<BackupResponse> {
    const response = await api.post(`${this.baseUrl}/${id}/restore`);
    return response.data;
  }

  async deleteBackup(id: number): Promise<BackupResponse> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getStats(): Promise<BackupStatsResponse> {
    const response = await api.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  async processBackups(): Promise<ProcessBackupResponse> {
    const response = await api.post(`${this.baseUrl}/process`);
    return response.data;
  }
}

export const backupService = new BackupService(); 