'use client';

import { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '@/utils/api';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Alert, AlertDescription, Badge, Progress, Separator } from '@/components/ui/index';

interface ImportFormProps {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onBack?: () => void;
}

interface ImportResult {
  type: string;
  success_count: number;
  skipped_count: number;
  error_count: number;
  errors: Array<{
    row: number;
    message: string;
    details: any;
  }>;
  imported_data: Array<{
    id: number;
    name: string;
    row: number;
  }>;
  total_rows: number;
}

export default function ImportForm({ type, title, description, icon, color, onBack }: ImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Clear any previous validation errors
      setValidationError(null);
      
      // Validate file type
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select a CSV or Excel file');
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Please select a file smaller than 10MB');
        return;
      }

      setFile(selectedFile);
      setResult(null);
      setShowErrors(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setValidationError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.post(`/import/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      const importResult = response.data.result;
      setResult(importResult);

      if (importResult.error_count > 0) {
        toast.warning(`${importResult.success_count} imported, ${importResult.error_count} errors`);
      } else {
        toast.success(`Successfully imported ${importResult.success_count} items`);
      }

    } catch (error: any) {
      console.error('Import failed:', error);
      
      // Handle validation errors specifically
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        let errorMessage = '';
        
        // Handle file validation errors
        if (errors.file) {
          errorMessage = errors.file.join(', ');
        } else {
          // Handle other validation errors
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
        }
        
        setValidationError(errorMessage);
        toast.error('Validation failed. Please check the file format and try again.');
      } else {
        // Handle other types of errors
        const errorMessage = error.response?.data?.message || 'An error occurred during import';
        setValidationError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const downloadSample = async () => {
    try {
      const response = await api.get(`/import/sample/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sample_${type}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Sample file downloaded');
    } catch (error) {
      console.error('Failed to download sample:', error);
      toast.error('Failed to download sample file');
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setShowErrors(false);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Import Options
        </Button>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${color} text-white`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result ? (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Upload a CSV or Excel file with the correct format. Download the sample file to see the required structure. 
                  {type === 'members' && ' Note: Email and Date of Birth are required fields for member imports.'}
                </AlertDescription>
              </Alert>

              {/* Display validation errors prominently */}
              {validationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Validation Error:</strong> {validationError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={downloadSample}
                  disabled={uploading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!file ? (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">Choose a file to upload</p>
                      <p className="text-sm text-gray-500">CSV or Excel files up to 10MB</p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Select File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileText className="h-12 w-12 mx-auto text-green-500" />
                    <div>
                      <p className="text-lg font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleUpload} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Start Import'}
                      </Button>
                      <Button variant="outline" onClick={() => setFile(null)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{result.success_count}</p>
                  <p className="text-sm text-green-600">Successful</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{result.skipped_count}</p>
                  <p className="text-sm text-yellow-600">Skipped</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{result.error_count}</p>
                  <p className="text-sm text-red-600">Errors</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{result.total_rows}</p>
                  <p className="text-sm text-blue-600">Total Rows</p>
                </div>
              </div>

              {result.error_count > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Import Errors</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowErrors(!showErrors)}
                    >
                      {showErrors ? 'Hide' : 'Show'} Errors
                    </Button>
                  </div>
                  
                  {showErrors && (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {result.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Row {error.row}:</strong> {error.message}
                            {error.details && (
                              <div className="mt-1 text-xs">
                                {Object.entries(error.details).map(([key, value]) => (
                                  <div key={key}>
                                    <strong>{key}:</strong> {String(value)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {result.success_count > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Successfully Imported</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {result.imported_data.map((item, index) => (
                      <Badge key={index} variant="secondary" className="justify-between">
                        <span>{item.name}</span>
                        <span className="text-xs">Row {item.row}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                <Button onClick={resetForm} variant="primary">
                  Import Another File
                </Button>
                {onBack && (
                  <Button variant="secondary" onClick={onBack}>
                    Back to Import Options
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 