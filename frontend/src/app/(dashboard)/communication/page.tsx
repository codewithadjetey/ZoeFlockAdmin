"use client";
import React, { useState, useEffect } from "react";
import { 
  PageHeader, 
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
  Badge,
  SelectInput
} from "@/components/ui";
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Edit, 
  MoreHorizontal, 
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Mail,
  Phone,
  Bell
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";

interface Communication {
  id: string;
  type: 'email' | 'sms' | 'push' | 'announcement';
  subject: string;
  content: string;
  recipients: string[];
  sender: string;
  sentAt: string;
  status: 'draft' | 'sent' | 'failed' | 'scheduled';
  priority: 'low' | 'medium' | 'high';
  category: string;
  readCount: number;
  totalRecipients: number;
}

const mockCommunications: Communication[] = [
  {
    id: "1",
    type: "email",
    subject: "Sunday Service Reminder",
    content: "Don't forget about our Sunday service at 10:00 AM. We look forward to seeing you there!",
    recipients: ["all-members"],
    sender: "Pastor Johnson",
    sentAt: "2024-03-20 09:00",
    status: "sent",
    priority: "medium",
    category: "Service Reminders",
    readCount: 45,
    totalRecipients: 120
  },
  {
    id: "2",
    type: "sms",
    subject: "Youth Group Tonight",
    content: "Youth group meeting tonight at 7 PM. Bring your friends!",
    recipients: ["youth-members"],
    sender: "Sarah Johnson",
    sentAt: "2024-03-19 16:30",
    status: "sent",
    priority: "high",
    category: "Youth Ministry",
    readCount: 18,
    totalRecipients: 25
  },
  {
    id: "3",
    type: "announcement",
    subject: "New Bible Study Series",
    content: "Join us for our new Bible study series starting next week. We'll be studying the Book of Romans.",
    recipients: ["all-members"],
    sender: "Admin",
    sentAt: "2024-03-18 14:00",
    status: "sent",
    priority: "medium",
    category: "Bible Study",
    readCount: 67,
    totalRecipients: 120
  },
  {
    id: "4",
    type: "push",
    subject: "Prayer Request",
    content: "Please pray for the Smith family during this difficult time.",
    recipients: ["prayer-team"],
    sender: "Lisa Davis",
    sentAt: "2024-03-17 11:00",
    status: "sent",
    priority: "high",
    category: "Prayer",
    readCount: 23,
    totalRecipients: 30
  },
  {
    id: "5",
    type: "email",
    subject: "Monthly Newsletter",
    content: "Check out our monthly newsletter for updates on church activities and upcoming events.",
    recipients: ["newsletter-subscribers"],
    sender: "Admin",
    sentAt: "2024-03-16 10:00",
    status: "sent",
    priority: "low",
    category: "Newsletter",
    readCount: 89,
    totalRecipients: 150
  },
  {
    id: "6",
    type: "sms",
    subject: "Volunteer Needed",
    content: "We need volunteers for this Sunday's service. Please let us know if you can help.",
    recipients: ["volunteers"],
    sender: "Michael Brown",
    sentAt: "2024-03-15 15:00",
    status: "sent",
    priority: "medium",
    category: "Volunteering",
    readCount: 12,
    totalRecipients: 20
  },
  {
    id: "7",
    type: "announcement",
    subject: "Church Picnic",
    content: "Join us for our annual church picnic this Saturday. Food and games for the whole family!",
    recipients: ["all-members"],
    sender: "Admin",
    sentAt: "2024-03-14 12:00",
    status: "sent",
    priority: "medium",
    category: "Events",
    readCount: 78,
    totalRecipients: 120
  },
  {
    id: "8",
    type: "email",
    subject: "Financial Update",
    content: "Here's our monthly financial update. Thank you for your continued support.",
    recipients: ["finance-committee"],
    sender: "Treasurer",
    sentAt: "2024-03-13 09:00",
    status: "sent",
    priority: "low",
    category: "Finance",
    readCount: 8,
    totalRecipients: 12
  }
];

const communicationTypes = [
  "All Types",
  "Email",
  "SMS",
  "Push",
  "Announcement"
];

const categories = [
  "All Categories",
  "Service Reminders",
  "Youth Ministry",
  "Bible Study",
  "Prayer",
  "Newsletter",
  "Volunteering",
  "Events",
  "Finance"
];

const priorities = [
  "All Priorities",
  "Low",
  "Medium",
  "High"
];

const statuses = [
  "All Status",
  "Draft",
  "Sent",
  "Failed",
  "Scheduled"
];

export default function CommunicationPage() {
  const [communications, setCommunications] = useState<Communication[]>(mockCommunications);
  const [filteredCommunications, setFilteredCommunications] = useState<Communication[]>(mockCommunications);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPriority, setSelectedPriority] = useState("All Priorities");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState<keyof Communication>("sentAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCommunication, setEditingCommunication] = useState<Communication | null>(null);
  const [selectedCommunications, setSelectedCommunications] = useState<string[]>([]);

  // Filter and sort communications
  useEffect(() => {
    let filtered = communications.filter(comm => {
      const matchesSearch = comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           comm.sender.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "All Types" || comm.type === selectedType.toLowerCase();
      const matchesCategory = selectedCategory === "All Categories" || comm.category === selectedCategory;
      const matchesPriority = selectedPriority === "All Priorities" || comm.priority === selectedPriority.toLowerCase();
      const matchesStatus = selectedStatus === "All Status" || comm.status === selectedStatus.toLowerCase();
      
      return matchesSearch && matchesType && matchesCategory && matchesPriority && matchesStatus;
    });

    // Sort communications
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

    setFilteredCommunications(filtered);
  }, [communications, searchTerm, selectedType, selectedCategory, selectedPriority, selectedStatus, sortBy, sortOrder]);

  const handleSort = (column: keyof Communication) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleNewCommunication = (commData: Partial<Communication>) => {
    const newComm: Communication = {
      id: Date.now().toString(),
      type: commData.type || 'email',
      subject: commData.subject || '',
      content: commData.content || '',
      recipients: commData.recipients || [],
      sender: commData.sender || 'Admin',
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'draft',
      priority: commData.priority || 'medium',
      category: commData.category || '',
      readCount: 0,
      totalRecipients: 0
    };
    
    setCommunications(prev => [newComm, ...prev]);
    setIsNewDialogOpen(false);
  };

  const handleCommunicationEdit = (comm: Communication) => {
    setEditingCommunication(comm);
    setIsEditDialogOpen(true);
  };

  const handleCommunicationUpdate = (updatedData: Partial<Communication>) => {
    if (editingCommunication) {
      setCommunications(prev => prev.map(comm => 
        comm.id === editingCommunication.id ? { ...comm, ...updatedData } : comm
      ));
      setIsEditDialogOpen(false);
      setEditingCommunication(null);
    }
  };

  const handleCommunicationDelete = (commId: string) => {
    setCommunications(prev => prev.filter(comm => comm.id !== commId));
    setSelectedCommunications(prev => prev.filter(id => id !== commId));
  };

  const handleBulkDelete = () => {
    setCommunications(prev => prev.filter(comm => !selectedCommunications.includes(comm.id)));
    setSelectedCommunications([]);
  };

  const handleSendCommunication = (comm: Communication) => {
    // Simulate sending communication
    console.log(`Sending ${comm.type} communication: ${comm.subject}`);
    setCommunications(prev => prev.map(c => 
      c.id === comm.id ? { ...c, status: 'sent' } : c
    ));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400", icon: "●" },
      sent: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: "●" },
      failed: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: "●" },
      scheduled: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: "●" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
      medium: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
      high: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
    return (
      <Badge className={`${config.color} border-0`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'email': <Mail className="w-4 h-4 text-blue-500" />,
      'sms': <MessageSquare className="w-4 h-4 text-green-500" />,
      'push': <Bell className="w-4 h-4 text-purple-500" />,
      'announcement': <MessageSquare className="w-4 h-4 text-orange-500" />
    };
    
    return iconMap[type] || <MessageSquare className="w-4 h-4 text-gray-500" />;
  };

  return (
    <>
      <PageHeader
        title="Communication Management"
        description="Manage all church communications including emails, SMS, push notifications, and announcements"
      />

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search communications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {communicationTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

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

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Communication
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Communication</DialogTitle>
                <DialogDescription>
                  Send a new message to your church community
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type</Label>
                  <select
                    id="type"
                    className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push Notification</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">Subject</Label>
                  <Input id="subject" className="col-span-3" placeholder="Communication subject" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="content" className="text-right">Content</Label>
                  <Textarea 
                    value=""
                    onChange={() => {}}
                    placeholder="Communication content"
                    className="col-span-3"
                  />
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
                  <Label htmlFor="priority" className="text-right">Priority</Label>
                  <select
                    id="priority"
                    className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => handleNewCommunication({})}>
                  Create Communication
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {selectedCommunications.length > 0 && (
            <Button 
              variant="danger" 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedCommunications.length})
            </Button>
          )}

          <Button variant="outline" onClick={() => window.print()}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Export List
          </Button>
        </div>
      </div>

      {/* Communications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedCommunications.length === filteredCommunications.length && filteredCommunications.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCommunications(filteredCommunications.map(c => c.id));
                      } else {
                        setSelectedCommunications([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("subject")}
                >
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Subject
                    {sortBy === "subject" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Type
                    {sortBy === "type" && (
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
                  onClick={() => handleSort("sender")}
                >
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Sender
                    {sortBy === "sender" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("sentAt")}
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Sent Date
                    {sortBy === "sentAt" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Read Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommunications.map((comm) => (
                <TableRow key={comm.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedCommunications.includes(comm.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCommunications(prev => [...prev, comm.id]);
                        } else {
                          setSelectedCommunications(prev => prev.filter(id => id !== comm.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getTypeIcon(comm.type)}
                      <div className="ml-3">
                        <div className="font-medium text-gray-900 dark:text-white">{comm.subject}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {comm.content}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {comm.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{comm.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {comm.sender}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {comm.sentAt}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(comm.priority)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(comm.status)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {comm.totalRecipients > 0 ? `${Math.round((comm.readCount / comm.totalRecipients) * 100)}%` : '0%'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {comm.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleSendCommunication(comm)}>
                            <Send className="mr-2 h-4 w-4" />
                            Send
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleCommunicationEdit(comm)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleCommunicationDelete(comm.id)}
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
              Showing {filteredCommunications.length} of {communications.length} communications
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

      {/* Edit Communication Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Communication</DialogTitle>
            <DialogDescription>
              Update communication information
            </DialogDescription>
          </DialogHeader>
          {editingCommunication && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-subject" className="text-right">Subject</Label>
                <Input 
                  id="edit-subject" 
                  className="col-span-3" 
                  defaultValue={editingCommunication.subject}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-content" className="text-right">Content</Label>
                <Textarea 
                  value={editingCommunication.content}
                  onChange={() => {}}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">Category</Label>
                <select
                  id="edit-category"
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue={editingCommunication.category}
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-priority" className="text-right">Priority</Label>
                <select
                  id="edit-priority"
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue={editingCommunication.priority}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={() => handleCommunicationUpdate({})}
            >
              Update Communication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 