'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { httpFile } from '@/utils';

interface FileUpload {
  upload_token: string;
  filename: string;
  url: string;
  size: string;
  mime_type: string;
}

interface FileUploaderProps {
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  onUpload?: (files: FileUpload[]) => void;
  onError?: (error: string) => void;
  modelType?: string;
  modelId?: number;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  multiple = true,
  maxFiles = 10,
  maxSize = 10, // 10MB default
  acceptedTypes = [],
  onUpload,
  onError,
  modelType,
  modelId,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    // Check file type if specified
    if (acceptedTypes.length > 0) {
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type === type;
      });
      if (!isValidType) {
        return `File type not allowed. Accepted types: ${acceptedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<FileUpload> => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (modelType) {
      formData.append('model_type', modelType);
    }
    if (modelId) {
      formData.append('model_id', modelId.toString());
    }

    try {
      const response = await httpFile('files/upload', formData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Upload failed');
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<FileUpload[]> => {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    if (modelType) {
      formData.append('model_type', modelType);
    }
    if (modelId) {
      formData.append('model_id', modelId.toString());
    }

    try {
      const response = await httpFile('/files/upload-multiple', formData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Upload failed');
    }
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const errors: string[] = [];
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      }
    });

    if (errors.length > 0) {
      onError?.(errors.join('\n'));
      return;
    }

    // Check max files limit
    if (fileArray.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    setUploadProgress({});

    try {
      let uploadedFiles: FileUpload[];
      
      if (multiple && fileArray.length > 1) {
        uploadedFiles = await uploadMultipleFiles(fileArray);
      } else {
        uploadedFiles = await Promise.all(
          fileArray.map(file => uploadFile(file))
        );
      }

      setUploadedFiles(prev => [...prev, ...uploadedFiles]);
      onUpload?.(uploadedFiles);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  }, [multiple, maxFiles, maxSize, acceptedTypes, modelType, modelId, onUpload, onError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeFile = (token: string) => {
    setUploadedFiles(prev => prev.filter(file => file.upload_token !== token));
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="space-y-4">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {multiple ? `Up to ${maxFiles} files, max ${maxSize}MB each` : `Max ${maxSize}MB`}
              {acceptedTypes.length > 0 && (
                <span className="block">Accepted types: {acceptedTypes.join(', ')}</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.upload_token}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.mime_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.size} • {file.mime_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <button
                    type="button"
                    onClick={() => removeFile(file.upload_token)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {uploadProgress && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Upload Progress</h3>
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{progress}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader; 