import { http } from '@/utils';

export interface EntityOption {
  id: number;
  name: string;
}

export interface EntitiesResponse {
  success: boolean;
  message: string;
  data: {
    groups?: EntityOption[];
    families?: EntityOption[];
    members?: EntityOption[];
    events?: EntityOption[];
    eventsToday?: EntityOption[];
  };
}

export class EntitiesService {
  /**
   * Get entities for form selection
   * @param entities - Comma-separated list of entities to fetch (e.g., 'groups,families')
   * @param activeOnly - Filter only active entities (default: true)
   */
  static async getEntities(
    entities: string,
    activeOnly: boolean = true
  ): Promise<EntitiesResponse> {
    const params = new URLSearchParams();
    params.append('entities', entities);
    if (activeOnly !== undefined) {
      params.append('active_only', String(activeOnly));
    }

    const response = await http({ 
      method: 'get', 
      url: `/entities?${params.toString()}` 
    });
    
    return response.data as EntitiesResponse;
  }

  /**
   * Get groups for form selection
   */
  static async getGroups(activeOnly: boolean = true): Promise<EntityOption[]> {
    const response = await this.getEntities('groups', activeOnly);
    return response.data.groups || [];
  }

  /**
   * Get families for form selection
   */
  static async getFamilies(activeOnly: boolean = true): Promise<EntityOption[]> {
    const response = await this.getEntities('families', activeOnly);
    return response.data.families || [];
  }

  /**
   * Get both groups and families for form selection
   */
  static async getGroupsAndFamilies(activeOnly: boolean = true): Promise<{
    groups: EntityOption[];
    families: EntityOption[];
  }> {
    const response = await this.getEntities('groups,families', activeOnly);
    return {
      groups: response.data.groups || [],
      families: response.data.families || []
    };
  }

  /**
   * Get members for form selection
   */
  static async getMembers(activeOnly: boolean = true): Promise<EntityOption[]> {
    const response = await this.getEntities('members', activeOnly);
    return response.data.members || [];
  }
} 