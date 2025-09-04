'use client';

import { useErrorHandler } from '@/hooks/useErrorHandler';

interface ErrorHandlerWrapperProps {
  children: React.ReactNode;
}

export function ErrorHandlerWrapper({ children }: ErrorHandlerWrapperProps) {
  // Set up error handler for 403 redirects
  useErrorHandler();

  return <>{children}</>;
} 