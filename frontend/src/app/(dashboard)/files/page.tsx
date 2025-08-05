'use client';

import React, { useState } from 'react';
import FileUploader from '@/components/shared/FileUploader';
import Alert, {AlertDescription } from '@/components/ui/Alert';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface FileUpload {
  upload_token: string;
  filename: string;
  url: string;
  size: string;
  mime_type: string;
}

export default function FilesPage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpload = (files: FileUpload[]) => {
    console.log('Uploaded files:', files);
    setUploadedFiles(prev => [...prev, ...files]);
    setSuccess(`${files.length} file(s) uploaded successfully!`);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(null);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">File Upload</h1>
        <p className="text-gray-600 mt-2">
          Upload and manage files with drag and drop functionality
        </p>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Basic File Upload</CardTitle>
            <CardDescription>
              Upload any type of file with drag and drop support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader
              multiple={true}
              maxFiles={5}
              maxSize={10}
              onUpload={handleUpload}
              onError={handleError}
            />
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Image Upload</CardTitle>
            <CardDescription>
              Upload images only with preview support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader
              multiple={true}
              maxFiles={10}
              maxSize={5}
              acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
              onUpload={handleUpload}
              onError={handleError}
            />
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Upload documents and PDFs only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader
              multiple={true}
              maxFiles={3}
              maxSize={20}
              acceptedTypes={[
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain'
              ]}
              onUpload={handleUpload}
              onError={handleError}
            />
          </CardContent>
        </Card>

        {/* Single File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Single File Upload</CardTitle>
            <CardDescription>
              Upload one file at a time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader
              multiple={false}
              maxFiles={1}
              maxSize={50}
              onUpload={handleUpload}
              onError={handleError}
            />
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>
              All files uploaded in this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => (
                <div
                  key={file.upload_token}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.filename || 'Unknown file'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.size || 'Unknown size'} • {file.mime_type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  
                  {file.mime_type && file.mime_type.startsWith('image/') && (
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex space-x-2">
                    {file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View
                      </a>
                    )}
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-gray-500">
                      Token: {file.upload_token ? file.upload_token.slice(0, 8) + '...' : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clear Messages Button */}
      {(error || success) && (
        <div className="flex justify-center">
          <button
            onClick={clearMessages}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Messages
          </button>
        </div>
      )}
    </div>
  );
} 