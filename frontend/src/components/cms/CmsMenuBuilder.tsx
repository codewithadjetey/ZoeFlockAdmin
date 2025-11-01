"use client";
import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { Button, TextInput, SelectInput } from '@/components/ui';
import { CmsMenusService, type CmsMenu, type CmsMenuItem } from '@/services/cmsMenus';
import { toast } from 'react-toastify';

interface CmsMenuBuilderProps {
  menu: CmsMenu;
  onClose: () => void;
  onSuccess: () => void;
}

export const CmsMenuBuilder: React.FC<CmsMenuBuilderProps> = ({
  menu,
  onClose,
  onSuccess
}) => {
  const [menuItems, setMenuItems] = useState<CmsMenuItem[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CmsMenuItem | null>(null);

  useEffect(() => {
    loadMenuItems();
  }, [menu.id]);

  const loadMenuItems = async () => {
    try {
      const response = await CmsMenusService.getMenu(menu.id);
      if (response.success) {
        setMenuItems(response.data.rootItems || []);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: CmsMenuItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleItemSuccess = () => {
    setIsItemModalOpen(false);
    setEditingItem(null);
    loadMenuItems();
  };

  const handleDeleteItem = async (itemId: number) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        await CmsMenusService.deleteMenuItem(menu.id, itemId);
        await loadMenuItems();
        toast.success('Menu item deleted successfully');
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete menu item');
      }
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Manage: ${menu.name}`}
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Menu Items</h3>
          <Button onClick={handleAddItem}>
            <i className="fas fa-plus mr-2"></i>
            Add Item
          </Button>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-grip-vertical text-gray-400 cursor-move"></i>
                {item.icon && <i className={`${item.icon} text-gray-500`}></i>}
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditItem(item)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No menu items yet. Click "Add Item" to get started.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {isItemModalOpen && (
        <CmsMenuItemModal
          isOpen={isItemModalOpen}
          onClose={() => {
            setIsItemModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={handleItemSuccess}
          menuId={menu.id}
          item={editingItem}
          existingItems={menuItems}
        />
      )}
    </Modal>
  );
};

interface CmsMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  menuId: number;
  item?: CmsMenuItem | null;
  existingItems: CmsMenuItem[];
}

const CmsMenuItemModal: React.FC<CmsMenuItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  menuId,
  item,
  existingItems
}) => {
  const [formData, setFormData] = useState({
    label: '',
    type: 'link' as 'page' | 'link' | 'feature',
    url: '',
    icon: '',
    is_visible: true,
    target_window: '_self' as '_self' | '_blank',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        label: item.label || '',
        type: item.type || 'link',
        url: item.url || '',
        icon: item.icon || '',
        is_visible: item.is_visible ?? true,
        target_window: item.target_window || '_self',
      });
    } else {
      setFormData({
        label: '',
        type: 'link',
        url: '',
        icon: '',
        is_visible: true,
        target_window: '_self',
      });
    }
  }, [item]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (item) {
        await CmsMenusService.updateMenuItem(menuId, item.id, formData);
      } else {
        await CmsMenusService.addMenuItem(menuId, formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'link', label: 'Custom Link' },
    { value: 'page', label: 'Page' },
    { value: 'feature', label: 'Feature Index' }
  ];

  const targetOptions = [
    { value: '_self', label: 'Same Window' },
    { value: '_blank', label: 'New Window' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Menu Item' : 'Add Menu Item'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Label"
          value={formData.label}
          onChange={handleInputChange('label')}
          required
        />

        <SelectInput
          label="Type"
          value={formData.type}
          onChange={handleInputChange('type')}
          options={typeOptions}
        />

        {formData.type === 'link' && (
          <TextInput
            label="URL"
            value={formData.url}
            onChange={handleInputChange('url')}
            placeholder="https://example.com"
          />
        )}

        <TextInput
          label="Icon (Font Awesome class)"
          value={formData.icon}
          onChange={handleInputChange('icon')}
          placeholder="fas fa-home"
        />

        <SelectInput
          label="Open In"
          value={formData.target_window}
          onChange={handleInputChange('target_window')}
          options={targetOptions}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_visible"
            checked={formData.is_visible}
            onChange={handleCheckboxChange('is_visible')}
            className="w-4 h-4"
          />
          <label htmlFor="is_visible" className="text-sm">Visible</label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : (item ? 'Update' : 'Add')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

