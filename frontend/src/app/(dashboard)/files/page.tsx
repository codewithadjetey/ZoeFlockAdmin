"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  DataTable,
  Button,
  Input,
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  Label,
  Textarea,
  Badge
} from "@/components/ui";
import { 
  FileText, 
  Download, 
  Trash2, 
  Edit, 
  MoreHorizontal, 
  Upload, 
  FolderOpen,
  Search,
  Filter,
  Calendar,
  User,
  FileType,
  HardDrive
} from "lucide-react";

interface File {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  category: string;
  description?: string;
  downloads: number;
  status: 'active' | 'archived' | 'pending';
}

const mockFiles: File[] = [
  {
    id: "1",
    name: "Sunday Service Bulletin.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadedBy: "John Smith",
    uploadedAt: "2024-03-20",
    category: "Bulletins",
    description: "Weekly service bulletin for Sunday service",
    downloads: 45,
    status: "active"
  },
  {
    id: "2",
    name: "Youth Ministry Guidelines.docx",
    type: "DOCX",
    size: "1.8 MB",
    uploadedBy: "Sarah Johnson",
    uploadedAt: "2024-03-19",
    category: "Ministry",
    description: "Guidelines and policies for youth ministry",
    downloads: 23,
    status: "active"
  },
  {
    id: "3",
    name: "Financial Report Q1 2024.xlsx",
    type: "XLSX",
    size: "3.2 MB",
    uploadedBy: "Michael Brown",
    uploadedAt: "2024-03-18",
    category: "Finance",
    description: "First quarter financial report",
    downloads: 12,
    status: "active"
  },
  {
    id: "4",
    name: "Prayer Request Form.pdf",
    type: "PDF",
    size: "0.8 MB",
    uploadedBy: "Lisa Davis",
    uploadedAt: "2024-03-17",
    category: "Forms",
    description: "Form for submitting prayer requests",
    downloads: 67,
    status: "active"
  },
  {
    id: "5",
    name: "Choir Music Sheet.pdf",
    type: "PDF",
    size: "1.5 MB",
    uploadedBy: "David Wilson",
    uploadedAt: "2024-03-16",
    category: "Music",
    description: "Music sheet for choir practice",
    downloads: 18,
    status: "active"
  },
  {
    id: "6",
    name: "Event Planning Template.docx",
    type: "DOCX",
    size: "2.1 MB",
    uploadedBy: "Emily Chen",
    uploadedAt: "2024-03-15",
    category: "Templates",
    description: "Template for planning church events",
    downloads: 34,
    status: "active"
  },
  {
    id: "7",
    name: "Member Directory 2024.pdf",
    type: "PDF",
    size: "4.7 MB",
    uploadedBy: "Admin",
    uploadedAt: "2024-03-14",
    category: "Directory",
    description: "Updated member directory for 2024",
    downloads: 89,
    status: "active"
  },
  {
    id: "8",
    name: "Bible Study Notes.docx",
    type: "DOCX",
    size: "1.2 MB",
    uploadedBy: "Pastor Johnson",
    uploadedAt: "2024-03-13",
    category: "Study",
    description: "Notes from recent Bible study sessions",
    downloads: 56,
    status: "active"
  }
];

const categories = [
  "All Categories",
  "Bulletins",
  "Ministry",
  "Finance",
  "Forms",
  "Music",
  "Templates",
  "Directory",
  "Study"
];

const fileTypes = [
  "All Types",
  "PDF",
  "DOCX",
  "XLSX",
  "PPTX",
  "JPG",
  "PNG",
  "MP3",
  "MP4"
];

export default function FilesPage() {
  const [files, setFiles] = useState<File[]>(mockFiles);
  const [filteredFiles, setFilteredFiles] = useState<File[]>(mockFiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedFileType, setSelectedFileType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState<keyof File>("uploadedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Filter and sort files
  useEffect(() => {
    let filtered = files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All Categories" || file.category === selectedCategory;
      const matchesType = selectedFileType === "All Types" || file.type === selectedFileType;
      const matchesStatus = selectedStatus === "All" || file.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });

    // Sort files
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    setFilteredFiles(filtered);
  }, [files, searchTerm, selectedCategory, selectedFileType, selectedStatus, sortBy, sortOrder]);

  const handleSort = (column: keyof File) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleFileUpload = (fileData: Partial<File>) => {
    const newFile: File = {
      id: Date.now().toString(),
      name: fileData.name || '',
      type: fileData.type || '',
      size: fileData.size || '',
      uploadedBy: fileData.uploadedBy || 'Admin',
      uploadedAt: new Date().toISOString().split('T')[0],
      category: fileData.category || '',
      description: fileData.description || '',
      downloads: 0,
      status: 'active'
    };
    
    setFiles(prev => [newFile, ...prev]);
    setIsUploadDialogOpen(false);
  };

  const handleFileEdit = (file: File) => {
    setEditingFile(file);
    setIsEditDialogOpen(true);
  };

  const handleFileUpdate = (updatedData: Partial<File>) => {
    if (editingFile) {
      setFiles(prev => prev.map(file => 
        file.id === editingFile.id ? { ...file, ...updatedData } : file
      ));
      setIsEditDialogOpen(false);
      setEditingFile(null);
    }
  };

  const handleFileDelete = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  };

  const handleBulkDelete = () => {
    setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
  };

  const handleFileDownload = (file: File) => {
    // Simulate file download
    console.log(`Downloading ${file.name}`);
    // In a real app, this would trigger an actual download
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: "●" },
      archived: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400", icon: "●" },
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: "●" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getFileTypeIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'PDF': <FileText className="w-4 h-4 text-red-500" />,
      'DOCX': <FileText className="w-4 h-4 text-blue-500" />,
      'XLSX': <FileText className="w-4 h-4 text-green-500" />,
      'PPTX': <FileText className="w-4 h-4 text-orange-500" />,
      'JPG': <FileText className="w-4 h-4 text-purple-500" />,
      'PNG': <FileText className="w-4 h-4 text-indigo-500" />,
      'MP3': <FileText className="w-4 h-4 text-pink-500" />,
      'MP4': <FileText className="w-4 h-4 text-red-600" />
    };
    
    return iconMap[type] || <FileText className="w-4 h-4 text-gray-500" />;
  };

  return (
    <>>
      <PageHeader
        title="Files Management"
        description="Manage and organize all church files, documents, and resources"
      />

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* File Type Filter */}
          <select
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {fileTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New File</DialogTitle>
                <DialogDescription>
                  Add a new file to the church file system
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" className="col-span-3" placeholder="File name" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                  <select
                    id="category"
                    className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea 
                    value=""
                    onChange={() => {}}
                    placeholder="File description"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => handleFileUpload({})}>
                  Upload File
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {selectedFiles.length > 0 && (
            <Button 
              variant="danger" 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedFiles.length})
            </Button>
          )}

          <Button variant="outline" onClick={() => window.print()}>
            <FileText className="w-4 h-4 mr-2" />
            Export List
          </Button>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(filteredFiles.map(f => f.id));
                      } else {
                        setSelectedFiles([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    File Name
                    {sortBy === "name" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center">
                    <FileType className="w-4 h-4 mr-2" />
                    Type
                    {sortBy === "type" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("size")}
                >
                  <div className="flex items-center">
                    <HardDrive className="w-4 h-4 mr-2" />
                    Size
                    {sortBy === "size" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("category")}
                >
                  Category
                  {sortBy === "category" && (
                    <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("uploadedBy")}
                >
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Uploaded By
                    {sortBy === "uploadedBy" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("uploadedAt")}
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Upload Date
                    {sortBy === "uploadedAt" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(prev => [...prev, file.id]);
                        } else {
                          setSelectedFiles(prev => prev.filter(id => id !== file.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getFileTypeIcon(file.type)}
                      <div className="ml-3">
                        <div className="font-medium text-gray-900 dark:text-white">{file.name}</div>
                        {file.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {file.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {file.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    {file.size}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{file.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {file.uploadedBy}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {file.uploadedAt}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {file.downloads}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(file.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleFileDownload(file)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFileEdit(file)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleFileDelete(file.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {filteredFiles.length} of {files.length} files
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <span className="text-sm text-gray-700 dark:text-gray-300">Page 1 of 1</span>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit File Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File</DialogTitle>
            <DialogDescription>
              Update file information
            </DialogDescription>
          </DialogHeader>
          {editingFile && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input 
                  id="edit-name" 
                  className="col-span-3" 
                  defaultValue={editingFile.name}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">Category</Label>
                <select
                  id="edit-category"
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue={editingFile.category}
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">Description</Label>
                <Textarea 
                  value={editingFile.description || ""}
                  onChange={() => {}}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">Status</Label>
                <select
                  id="edit-status"
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue={editingFile.status}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={() => handleFileUpdate({})}
            >
              Update File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
     </>
  );
} 