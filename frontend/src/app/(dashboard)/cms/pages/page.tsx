"use client";
import React, { useState, useEffect } from "react";
import { PageHeader, SearchInput, SelectInput, ViewToggle, Button, DataTable, StatusBadge, type Column } from "@/components/ui";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { CmsPagesService, type CmsPage } from "@/services/cmsPages";
import { CmsPageModal } from "@/components/cms/CmsPageModal";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";

export default function CmsPagesPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPage | undefined>();
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  useEffect(() => {
    loadPages();
  }, [statusFilter, pagination.current_page, searchTerm]);

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const response = await CmsPagesService.getPages({
        search: searchTerm || undefined,
        status: statusFilter === "All Status" ? undefined : statusFilter as any,
        page: pagination.current_page,
        per_page: pagination.per_page
      });
      
      if (response.success) {
        setPages(response.pages.data);
        setPagination({
          current_page: response.pages.current_page,
          last_page: response.pages.last_page,
          per_page: response.pages.per_page,
          total: response.pages.total
        });
      }
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePage = () => {
    setEditingPage(undefined);
    setIsModalOpen(true);
  };

  const handleEditPage = (page: CmsPage) => {
    setEditingPage(page);
    setIsModalOpen(true);
  };

  const handlePageSuccess = (page: CmsPage) => {
    if (editingPage) {
      setPages(prev => prev.map(p => p.id === page.id ? page : p));
      toast.success('Page updated successfully');
    } else {
      setPages(prev => [page, ...prev]);
      toast.success('Page created successfully');
    }
    setIsModalOpen(false);
    setEditingPage(undefined);
  };

  const handleDeletePage = async (pageId: number) => {
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        await CmsPagesService.deletePage(pageId);
        setPages(prev => prev.filter(p => p.id !== pageId));
        toast.success('Page deleted successfully');
      } catch (error) {
        console.error('Error deleting page:', error);
        toast.error('Failed to delete page');
      }
    }
  };

  const handlePublishPage = async (pageId: number) => {
    try {
      await CmsPagesService.publishPage(pageId);
      await loadPages();
      toast.success('Page published successfully');
    } catch (error) {
      console.error('Error publishing page:', error);
      toast.error('Failed to publish page');
    }
  };

  const columns: Column<CmsPage>[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, page: CmsPage) => (
        <StatusBadge 
          status={page.status || 'draft'} 
          className="capitalize"
        />
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: any, page: CmsPage) => (
        page.created_at ? new Date(page.created_at).toLocaleDateString() : '-'
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, page: CmsPage) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditPage(page)}
          >
            Edit
          </Button>
          {page.status && page.status !== 'published' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePublishPage(page.id)}
            >
              Publish
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeletePage(page.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const statusOptions = [
    { value: "All Status", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "scheduled", label: "Scheduled" }
  ];

  const viewToggleOptions = [
    { value: "grid", label: "Grid", icon: "fas fa-th" },
    { value: "table", label: "Table", icon: "fas fa-table" },
  ];

  return (
    <>
      <PageHeader
        title="CMS Pages"
        description="Manage your church website pages"
        actions={
          <Button onClick={handleCreatePage}>
            <i className="fas fa-plus mr-2"></i>
            Add Page
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-4">
        <SearchInput
          placeholder="Search pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <SelectInput
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-[150px]"
        />
        <ViewToggle
          value={viewMode}
          onChange={setViewMode}
          options={viewToggleOptions}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={pages}
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({ ...prev, current_page: page }))}
        />
      )}

      {isModalOpen && (
        <CmsPageModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPage(undefined);
          }}
          onSuccess={handlePageSuccess}
          page={editingPage}
        />
      )}
    </>
  );
}

