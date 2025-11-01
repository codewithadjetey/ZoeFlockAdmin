"use client";
import React, { useState, useEffect } from "react";
import { PageHeader, SearchInput, SelectInput, Button, DataTable, StatusBadge, type Column } from "@/components/ui";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { AnnouncementsService, type Announcement } from "@/services/announcements";
import { AnnouncementModal } from "@/components/announcements/AnnouncementModal";
import { toast } from "react-toastify";

export default function AnnouncementsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | undefined>();
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  useEffect(() => {
    loadAnnouncements();
  }, [categoryFilter, pagination.current_page, searchTerm]);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await AnnouncementsService.getAnnouncements({
        search: searchTerm || undefined,
        category: categoryFilter === "All Categories" ? undefined : categoryFilter as any,
        page: pagination.current_page,
        per_page: pagination.per_page
      });
      
      if (response.success) {
        setAnnouncements(response.announcements.data);
        setPagination({
          current_page: response.announcements.current_page,
          last_page: response.announcements.last_page,
          per_page: response.announcements.per_page,
          total: response.announcements.total
        });
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(undefined);
    setIsModalOpen(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleAnnouncementSuccess = (announcement: Announcement) => {
    if (editingAnnouncement) {
      setAnnouncements(prev => prev.map(a => a.id === announcement.id ? announcement : a));
      toast.success('Announcement updated successfully');
    } else {
      setAnnouncements(prev => [announcement, ...prev]);
      toast.success('Announcement created successfully');
    }
    setIsModalOpen(false);
    setEditingAnnouncement(undefined);
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await AnnouncementsService.deleteAnnouncement(announcementId);
        setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
        toast.success('Announcement deleted successfully');
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast.error('Failed to delete announcement');
      }
    }
  };

  const columns: Column<Announcement>[] = [
    { key: 'title', label: 'Title', sortable: true },
    {
      key: 'category',
      label: 'Category',
      render: (announcement: Announcement) => (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded capitalize">
          {announcement.category}
        </span>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (announcement: Announcement) => (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded capitalize ${
          announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
          announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {announcement.priority}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (announcement: Announcement) => (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
          announcement.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {announcement.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (announcement: Announcement) => (
        announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : '-'
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (announcement: Announcement) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditAnnouncement(announcement)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteAnnouncement(announcement.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const categoryOptions = [
    { value: "All Categories", label: "All Categories" },
    { value: "general", label: "General" },
    { value: "events", label: "Events" },
    { value: "updates", label: "Updates" },
    { value: "urgent", label: "Urgent" }
  ];

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Manage church announcements and news"
        actions={
          <Button onClick={handleCreateAnnouncement}>
            <i className="fas fa-plus mr-2"></i>
            Add Announcement
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-4">
        <SearchInput
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <SelectInput
          options={categoryOptions}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-[150px]"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={announcements}
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({ ...prev, current_page: page }))}
        />
      )}

      {isModalOpen && (
        <AnnouncementModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAnnouncement(undefined);
          }}
          onSuccess={handleAnnouncementSuccess}
          announcement={editingAnnouncement}
        />
      )}
    </>
  );
}

