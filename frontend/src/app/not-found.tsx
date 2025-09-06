'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Home, ArrowLeft, Search, FileX, RefreshCw } from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSearch = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <FileX className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Sorry, we couldn't find the page you're looking for.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Search className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-2">What you can do:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Check the URL for typos</li>
                    <li>• Go back to the previous page</li>
                    <li>• Return to the dashboard</li>
                    <li>• Contact support if the problem persists</li>
                  </ul>
                </div>
              </div>
            </div>

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
                onClick={handleRefresh}
                variant="secondary"
                className="w-full text-gray-600 hover:text-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>Error Code: 404 Not Found</p>
              <p>If you believe this is an error, please contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
