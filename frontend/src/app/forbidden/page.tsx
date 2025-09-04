'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertTriangle, Home, ArrowLeft, Shield, Mail, Key } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requiredPermissions, setRequiredPermissions] = useState<string[]>([]);
  const [requestedUrl, setRequestedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  useEffect(() => {
    // Get error details from query parameters
    const permissions = searchParams.get('permissions');
    const url = searchParams.get('url');
    const error = searchParams.get('error');
    const type = searchParams.get('errorType');
    
    if (permissions) {
      setRequiredPermissions(permissions.split(','));
    }
    if (url) {
      setRequestedUrl(url);
    }
    if (error) {
      setErrorMessage(error);
    }
    if (type) {
      setErrorType(type);
    }
  }, [searchParams]);

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleContactAdmin = () => {
    const subject = encodeURIComponent('Permission Request - Zoe Flock Admin');
    const body = encodeURIComponent(
      `Hello,\n\nI am requesting access to the following feature:\n\n` +
      `Error Message: ${errorMessage || 'Unknown'}\n` +
      `Error Type: ${errorType || 'Unknown'}\n` +
      `Required Permissions: ${requiredPermissions.join(', ') || 'Unknown'}\n` +
      `Requested URL: ${requestedUrl || 'Unknown'}\n\n` +
      `Please review my request and grant the necessary permissions.\n\n` +
      `Thank you,\n[Your Name]`
    );
    
    window.open(`mailto:admin@zoeflock.com?subject=${subject}&body=${body}`, '_blank');
  };

  const getPermissionDescription = (permission: string) => {
    const descriptions: Record<string, string> = {
      'view-members': 'View member information and profiles',
      'create-members': 'Add new members to the system',
      'edit-members': 'Modify existing member information',
      'delete-members': 'Remove members from the system',
      'view-events': 'View event details and schedules',
      'create-events': 'Create new events',
      'edit-events': 'Modify existing events',
      'delete-events': 'Remove events from the system',
      'view-tithes': 'View tithe records and reports',
      'create-tithes': 'Record new tithe payments',
      'edit-tithes': 'Modify tithe records',
      'delete-tithes': 'Remove tithe records',
      'view-users': 'View user accounts and profiles',
      'create-users': 'Create new user accounts',
      'edit-users': 'Modify user account settings',
      'delete-users': 'Remove user accounts',
      'view-roles': 'View role definitions and permissions',
      'create-roles': 'Create new roles',
      'edit-roles': 'Modify role permissions',
      'delete-roles': 'Remove roles from the system',
    };

    return descriptions[permission] || 'Access to this specific feature';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-600">
              You don't have permission to access this resource
            </CardDescription>
          </CardHeader>
          
                      <CardContent className="space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-red-700">
                      <p className="font-medium mb-2">Error Message</p>
                      <p className="text-red-800 bg-red-100 p-2 rounded font-medium">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}
           

            <div className="space-y-3">
              <Button 
                onClick={handleGoHome}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button 
                onClick={handleGoBack}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Button 
                onClick={handleContactAdmin}
                variant="secondary"
                className="w-full text-gray-600 hover:text-gray-800"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Administrator
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>Error Code: 403 Forbidden</p>
              <p>If you need access to this feature, please request it from your administrator.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 