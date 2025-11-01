"use client";
import React, { useState, useEffect } from "react";
import { PageHeader, SearchInput, SelectInput, Button, LoadingSpinner } from "@/components/ui";
import { CmsMenusService, type CmsMenu } from "@/services/cmsMenus";
import { CmsMenuModal } from "@/components/cms/CmsMenuModal";
import { CmsMenuBuilder } from "@/components/cms/CmsMenuBuilder";
import { toast } from "react-toastify";

export default function CmsMenusPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [menus, setMenus] = useState<CmsMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<CmsMenu | undefined>();
  const [selectedMenu, setSelectedMenu] = useState<CmsMenu | null>(null);

  useEffect(() => {
    loadMenus();
  }, [locationFilter]);

  const loadMenus = async () => {
    setIsLoading(true);
    try {
      const response = await CmsMenusService.getMenus({
        location: locationFilter === "all" ? undefined : locationFilter as any
      });
      
      if (response.success) {
        setMenus(response.data);
      }
    } catch (error) {
      console.error('Error loading menus:', error);
      toast.error('Failed to load menus');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMenu = () => {
    setEditingMenu(undefined);
    setIsModalOpen(true);
  };

  const handleEditMenu = (menu: CmsMenu) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleMenuSuccess = (menu: CmsMenu) => {
    if (editingMenu) {
      setMenus(prev => prev.map(m => m.id === menu.id ? menu : m));
      toast.success('Menu updated successfully');
    } else {
      setMenus(prev => [menu, ...prev]);
      toast.success('Menu created successfully');
    }
    setIsModalOpen(false);
    setEditingMenu(undefined);
    loadMenus();
  };

  const handleDeleteMenu = async (menuId: number) => {
    if (confirm('Are you sure you want to delete this menu? All menu items will also be deleted.')) {
      try {
        await CmsMenusService.deleteMenu(menuId);
        setMenus(prev => prev.filter(m => m.id !== menuId));
        toast.success('Menu deleted successfully');
      } catch (error) {
        console.error('Error deleting menu:', error);
        toast.error('Failed to delete menu');
      }
    }
  };

  const handleManageMenu = (menu: CmsMenu) => {
    setSelectedMenu(menu);
  };

  const locationOptions = [
    { value: "all", label: "All Locations" },
    { value: "header", label: "Header" },
    { value: "footer", label: "Footer" },
    { value: "sidebar", label: "Sidebar" }
  ];

  return (
    <>
      <PageHeader
        title="CMS Menus"
        description="Manage your church website navigation menus"
        actions={
          <Button onClick={handleCreateMenu}>
            <i className="fas fa-plus mr-2"></i>
            Add Menu
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-4">
        <SearchInput
          placeholder="Search menus..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <SelectInput
          options={locationOptions}
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="w-[150px]"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <div key={menu.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{menu.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{menu.location}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {menu.items?.length || 0} items
                </span>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManageMenu(menu)}
                  className="flex-1"
                >
                  <i className="fas fa-bars mr-1"></i>
                  Manage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditMenu(menu)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteMenu(menu.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CmsMenuModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMenu(undefined);
          }}
          onSuccess={handleMenuSuccess}
          menu={editingMenu}
        />
      )}

      {selectedMenu && (
        <CmsMenuBuilder
          menu={selectedMenu}
          onClose={() => setSelectedMenu(null)}
          onSuccess={() => {
            setSelectedMenu(null);
            loadMenus();
          }}
        />
      )}
    </>
  );
}

