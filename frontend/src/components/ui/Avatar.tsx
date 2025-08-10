import React from 'react';
import { getImageUrl } from '@/utils/helpers';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl'
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallback = '',
  size = 'md',
  className = '',
  onClick
}) => {
  const imageUrl = getImageUrl(src || null);
  const initials = getInitials(fallback);
  
  const baseClasses = `rounded-full overflow-hidden flex items-center justify-center font-medium ${
    onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
  }`;
  
  const sizeClass = sizeClasses[size];
  const bgColor = getAvatarBgColor(fallback);

  if (imageUrl) {
    return (
      <div 
        className={`${baseClasses} ${sizeClass} ${className}`}
        onClick={onClick}
      >
        <img 
          src={imageUrl} 
          alt={alt || fallback}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="text-white">${initials}</span>`;
              parent.className = `${baseClasses} ${sizeClass} ${bgColor} ${className}`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${sizeClass} ${bgColor} ${className}`}
      onClick={onClick}
    >
      <span className="text-white font-semibold">
        {initials}
      </span>
    </div>
  );
};

// Helper function to get initials from name
const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Helper function to get consistent background color based on name
const getAvatarBgColor = (name: string): string => {
  if (!name) return 'bg-gray-500';
  
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ];
  
  // Generate a consistent hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default Avatar; 