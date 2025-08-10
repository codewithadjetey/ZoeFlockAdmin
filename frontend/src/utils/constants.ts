// Theme Colors
export const THEME_COLORS = {
  blue: { name: 'blue', value: '#3b82f6', icon: 'fas fa-palette', bgClass: 'bg-blue-500' },
  green: { name: 'green', value: '#10b981', icon: 'fas fa-leaf', bgClass: 'bg-green-500' },
  purple: { name: 'purple', value: '#8b5cf6', icon: 'fas fa-star', bgClass: 'bg-purple-500' },
  orange: { name: 'orange', value: '#f59e0b', icon: 'fas fa-fire', bgClass: 'bg-orange-500' },
  pink: { name: 'pink', value: '#ec4899', icon: 'fas fa-heart', bgClass: 'bg-pink-500' },
};

// Navigation Items
export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-tachometer-alt' },
  { name: 'Members', href: '/dashboard/members', icon: 'fas fa-users' },
  { name: 'Events', href: '/dashboard/events', icon: 'fas fa-calendar' },
  { name: 'Donations', href: '/dashboard/donations', icon: 'fas fa-hand-holding-heart' },
  { name: 'Groups', href: '/dashboard/groups', icon: 'fas fa-layer-group' },
  { name: 'Attendance', href: '/dashboard/attendance', icon: 'fas fa-clipboard-check' },
  { name: 'Communication', href: '/dashboard/communication', icon: 'fas fa-comments' },
  { name: 'Settings', href: '/dashboard/settings', icon: 'fas fa-cog' },
];

// Status Options
export const STATUS_OPTIONS = [
  { value: "All Status", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "New", label: "New" },
];

// Group Options
export const GROUP_OPTIONS = [
  { value: "All Groups", label: "All Groups" },
  { value: "Youth Ministry", label: "Youth Ministry" },
  { value: "Bible Study", label: "Bible Study" },
  { value: "Choir", label: "Choir" },
  { value: "Prayer Group", label: "Prayer Group" },
]; 