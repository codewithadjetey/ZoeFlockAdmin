import { api } from '@/utils/api';
import {
  AuditLog,
  AuditLogFilters,
  AuditLogListResponse
} from '@/interfaces/auditLogs';

export class AuditLogsService {
  /**
   * Get audit logs with optional filters
   */
  static async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/import/audit-logs?${params.toString()}`);
    return response.data as AuditLogListResponse;
  }
}

