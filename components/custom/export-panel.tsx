'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toast } from '@/components/ui/toast';
import { Download } from 'lucide-react';

interface ExportPanelProps {
  onExport?: () => void;
  isLoading?: boolean;
}

export function ExportPanel({ onExport, isLoading = false }: ExportPanelProps) {
  const [showToast, setShowToast] = useState(false);

  const handleExport = () => {
    console.log('Compiling Multi-Sheet Employee Data Matrix...');
    console.log('Export triggered at:', new Date().toISOString());
    setShowToast(true);
    
    if (onExport) {
      onExport();
    }
  };

  return (
    <>
      <Card className="shadow-md border-2">
        <CardHeader className="border-b bg-institutional-50">
          <CardTitle className="text-base font-semibold text-institutional-800">Data Export</CardTitle>
          <CardDescription className="text-sm">
            Export employee profile data to Excel format for offline analysis and reporting
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <Button
            onClick={handleExport}
            disabled={isLoading}
            className="w-full sm:w-auto h-10 px-6"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Exporting...' : 'Export Master Data to Excel'}
          </Button>
          <p className="text-xs text-institutional-600 mt-4 leading-relaxed">
            This will compile all employee profiles, qualifications, employment history,
            research publications, certifications, and medical records into a multi-sheet
            Excel workbook for comprehensive reporting.
          </p>
        </CardContent>
      </Card>

      {showToast && (
        <Toast
          message="Compiling Multi-Sheet Employee Data Matrix..."
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
