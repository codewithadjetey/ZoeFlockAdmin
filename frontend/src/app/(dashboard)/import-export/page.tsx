'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  User, 
  Calendar, 
  Handshake, 
  DollarSign, 
  Receipt, 
  Download, 
  Upload, 
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  SeparatorHorizontal
} from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '@/utils/api';
import { Alert, AlertDescription, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/index';

interface ImportOption {
  name: string;
  description: string;
  sample_file: string;
  endpoint: string;
  icon: React.ReactNode;
  color: string;
  type: string;
}

export default function ImportExportPage() {
  const [importOptions, setImportOptions] = useState<ImportOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImportOptions();
  }, []);

  const fetchImportOptions = async () => {
    try {
      const response = await api.get('/import');
      const options = (response.data as any).available_imports;
      
      const importOptionsWithIcons: ImportOption[] = [
        {
          ...options.families,
          icon: <Building2 className="h-5 w-5" />,
          color: 'bg-blue-500'
        },
        {
          ...options.groups,
          icon: <Users className="h-5 w-5" />,
          color: 'bg-green-500'
        },
        {
          ...options.members,
          icon: <User className="h-5 w-5" />,
          color: 'bg-purple-500'
        },
        {
          ...options.event_categories,
          icon: <Calendar className="h-5 w-5" />,
          color: 'bg-orange-500'
        },
        {
          ...options.partnership_categories,
          icon: <Handshake className="h-5 w-5" />,
          color: 'bg-indigo-500'
        },
        {
          ...options.income_categories,
          icon: <DollarSign className="h-5 w-5" />,
          color: 'bg-emerald-500'
        },
        {
          ...options.expense_categories,
          icon: <Receipt className="h-5 w-5" />,
          color: 'bg-red-500'
        },
      ];
      
      setImportOptions(importOptionsWithIcons);
    } catch (error) {
      console.error('Failed to fetch import options:', error);
      toast.error('Failed to load import options');
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = async (type: string, filename: string) => {
    console.log('Downloading sample for type:', type);
    try {
      const response = await api.get(`/import/sample/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Sample file downloaded: ${filename}`);
    } catch (error) {
      console.error('Failed to download sample:', error);
      toast.error('Failed to download sample file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading import options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Before importing, download the sample files to understand the required format. 
          Make sure your data matches the column headers exactly.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {importOptions.map((option, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${option.color} text-white`}>
                  {option.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{option.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {option.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadSample(
                    option.type,
                    `sample_${option.type}.csv`
                  )}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    // Navigate to specific import page
                    window.location.href = `/import-export/${option.type}`;
                  }}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import {option.name.replace('Import ', '')}
                </Button>
              </div>
              
              <SeparatorHorizontal />
              
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <FileText className="h-3 w-3" />
                  Supported formats: CSV, Excel
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Duplicate validation included
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Import Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Before Importing:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Download and review the sample file format</li>
                <li>• Ensure all required fields are filled</li>
                <li>• Check for duplicate data in your file</li>
                <li>• Verify phone numbers and email formats</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">During Import:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• System will validate each row</li>
                <li>• Duplicates will be skipped automatically</li>
                <li>• Errors will be reported with row numbers</li>
                <li>• All actions are logged for audit purposes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 