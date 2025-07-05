export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'New';
  group: string;
  joinDate: string;
  avatar: string;
}

export const membersData: Member[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
    group: "Youth Ministry",
    joinDate: "2024-01-15",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 (555) 234-5678",
    status: "Active",
    group: "Bible Study",
    joinDate: "2023-11-20",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+1 (555) 345-6789",
    status: "Active",
    group: "Choir",
    joinDate: "2024-02-10",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Michael Brown",
    email: "michael@example.com",
    phone: "+1 (555) 456-7890",
    status: "Inactive",
    group: "Prayer Group",
    joinDate: "2023-09-05",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "Lisa Wilson",
    email: "lisa@example.com",
    phone: "+1 (555) 567-8901",
    status: "Active",
    group: "Youth Ministry",
    joinDate: "2024-01-25",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face",
  },
  {
    id: 6,
    name: "David Miller",
    email: "david@example.com",
    phone: "+1 (555) 678-9012",
    status: "Active",
    group: "Bible Study",
    joinDate: "2023-12-15",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face",
  },
];

export const getMembers = (): Member[] => {
  return membersData;
};

export const getMembersByStatus = (status: string): Member[] => {
  if (status === 'All Status') return membersData;
  return membersData.filter(member => member.status === status);
};

export const getMembersByGroup = (group: string): Member[] => {
  if (group === 'All Groups') return membersData;
  return membersData.filter(member => member.group === group);
};

export const searchMembers = (query: string): Member[] => {
  const lowercaseQuery = query.toLowerCase();
  return membersData.filter(member => 
    member.name.toLowerCase().includes(lowercaseQuery) ||
    member.email.toLowerCase().includes(lowercaseQuery)
  );
}; 