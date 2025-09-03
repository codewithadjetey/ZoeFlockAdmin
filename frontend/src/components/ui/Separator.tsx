import React from 'react';

interface SeparatorProps {
  className?: string;
}

export default function Separator({ className = '' }: SeparatorProps) {
  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 ${className}`} />
  );
} 