"use client";
import React, { useState, useEffect } from "react";
import { PageHeader, SearchInput, SelectInput, Button, DataTable, StatusBadge, type Column } from "@/components/ui";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { SermonsService, type Sermon } from "@/services/sermons";
import { SermonModal } from "@/components/sermons/SermonModal";
import { toast } from "react-toastify";

export default function SermonsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | undefined>();
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  useEffect(() => {
    loadSermons();
  }, [statusFilter, pagination.current_page, searchTerm]);

  const loadSermons = async () => {
    setIsLoading(true);
    try {
      const response = await SermonsService.getSermons({
        search: searchTerm || undefined,
        status: statusFilter === "All Status" ? undefined : statusFilter as any,
        page: pagination.current_page,
        per_page: pagination.per_page
      });
      
      if (response.success) {
        setSermons(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total
        });
      }
    } catch (error) {
      console.error('Error loading sermons:', error);
      toast.error('Failed to load sermons');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSermon = () => {
    setEditingSermon(undefined);
    setIsModalOpen(true);
  };

  const handleEditSermon = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setIsModalOpen(true);
  };

  const handleSermonSuccess = (sermon: Sermon) => {
    if (editingSermon) {
      setSermons(prev => prev.map(s => s.id === sermon.id ? sermon : s));
      toast.success('Sermon updated successfully');
    } else {
      setSermons(prev => [sermon, ...prev]);
      toast.success('Sermon created successfully');
    }
    setIsModalOpen(false);
    setEditingSermon(undefined);
  };

  const handleDeleteSermon = async (sermonId: number) => {
    if (confirm('Are you sure you want to delete this sermon?')) {
      try {
        await SermonsService.deleteSermon(sermonId);
        setSermons(prev => prev.filter(s => s.id !== sermonId));
        toast.success('Sermon deleted successfully');
      } catch (error) {
        console.error('Error deleting sermon:', error);
        toast.error('Failed to delete sermon');
      }
    }
  };

  const handlePublishSermon = async (sermonId: number) => {
    try {
      await SermonsService.publishSermon(sermonId);
      await loadSermons();
      toast.success('Sermon published successfully');
    } catch (error) {
      console.error('Error publishing sermon:', error);
      toast.error('Failed to publish sermon');
    }
  };

  const columns: Column<Sermon>[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'speaker', label: 'Speaker', sortable: true },
    { 
      key: 'sermon_date', 
      label: 'Date', 
      render: (sermon: Sermon) => (
        sermon.sermon_date ? new Date(sermon.sermon_date).toLocaleDateString() : '-'
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (sermon: Sermon) => (
        <StatusBadge 
          status={sermon.status} 
          className="capitalize"
        />
      )
    },
    {
      key: 'media_count',
      label: 'Media',
      render: (sermon: Sermon) => (
        <span className="text-sm">{sermon.media?.length || 0}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (sermon: Sermon) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditSermon(sermon)}
          >
            Edit
          </Button>
          {sermon.status !== 'published' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePublishSermon(sermon.id)}
            >
              Publish
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteSermon(sermon.id)}
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
    { value: "published", label: "Published" }
  ];

  return (
    <>
      <PageHeader
        title="Sermons"
        description="Manage your church sermons with audio, video, and notes"
        actions={
          <Button onClick={handleCreateSermon}>
            <i className="fas fa-plus mr-2"></i>
            Add Sermon
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-4">
        <SearchInput
          placeholder="Search sermons..."
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
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={sermons}
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({ ...prev, current_page: page }))}
        />
      )}

      {isModalOpen && (
        <SermonModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSermon(undefined);
          }}
          onSuccess={handleSermonSuccess}
          sermon={editingSermon}
        />
      )}
    </>
  );
}

