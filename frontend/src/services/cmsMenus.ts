import { http } from '@/utils';

export interface CmsMenuItem {
  id: number;
  menu_id: number;
  parent_id?: number;
  label: string;
  type: 'page' | 'link' | 'feature';
  target_id?: number;
  url?: string;
  icon?: string;
  order: number;
  is_visible: boolean;
  target_window: '_self' | '_blank';
  created_at?: string;
  updated_at?: string;
  children?: CmsMenuItem[];
}

export interface CmsMenu {
  id: number;
  name: string;
  location: 'header' | 'footer' | 'sidebar';
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  creator?: any;
  updater?: any;
  rootItems?: CmsMenuItem[];
  items?: CmsMenuItem[];
}

export interface CmsMenusResponse {
  success: boolean;
  message: string;
  data: CmsMenu[];
}

export interface CmsMenuResponse {
  success: boolean;
  message: string;
  data: CmsMenu;
}

export interface CmsMenuItemResponse {
  success: boolean;
  message: string;
  data: CmsMenuItem;
}

export class CmsMenusService {
  static async getMenus(filters: {
    location?: 'header' | 'footer' | 'sidebar';
  } = {}): Promise<CmsMenusResponse> {
    const params = new URLSearchParams();
    if (filters.location) params.append('location', filters.location);

    const response = await http({ method: 'get', url: `/cms/menus?${params.toString()}` });
    return response.data as CmsMenusResponse;
  }

  static async getMenu(id: number): Promise<CmsMenuResponse> {
    const response = await http({ method: 'get', url: `/cms/menus/${id}` });
    return response.data as CmsMenuResponse;
  }

  static async createMenu(data: {
    name: string;
    location: 'header' | 'footer' | 'sidebar';
  }): Promise<CmsMenuResponse> {
    const response = await http({ method: 'post', url: '/cms/menus', data });
    return response.data;
  }

  static async updateMenu(id: number, data: Partial<CmsMenu>): Promise<CmsMenuResponse> {
    const response = await http({ method: 'put', url: `/cms/menus/${id}`, data });
    return response.data;
  }

  static async deleteMenu(id: number): Promise<any> {
    const response = await http({ method: 'delete', url: `/cms/menus/${id}` });
    return response.data;
  }

  static async addMenuItem(menuId: number, data: {
    label: string;
    type: 'page' | 'link' | 'feature';
    target_id?: number;
    url?: string;
    icon?: string;
    parent_id?: number;
    is_visible?: boolean;
    target_window?: '_self' | '_blank';
  }): Promise<CmsMenuItemResponse> {
    const response = await http({ method: 'post', url: `/cms/menus/${menuId}/items`, data });
    return response.data;
  }

  static async updateMenuItem(menuId: number, itemId: number, data: Partial<CmsMenuItem>): Promise<CmsMenuItemResponse> {
    const response = await http({ method: 'put', url: `/cms/menus/${menuId}/items/${itemId}`, data });
    return response.data;
  }

  static async deleteMenuItem(menuId: number, itemId: number): Promise<any> {
    const response = await http({ method: 'delete', url: `/cms/menus/${menuId}/items/${itemId}` });
    return response.data;
  }

  static async reorderItems(menuId: number, items: Array<{ id: number; order: number; parent_id?: number }>): Promise<any> {
    const response = await http({ method: 'put', url: `/cms/menus/${menuId}/items/reorder`, data: { items } });
    return response.data;
  }
}

