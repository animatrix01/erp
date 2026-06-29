'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/custom/file-upload';
import { FileList } from '@/components/custom/file-list';
import { FolderOpen, Upload, Files } from 'lucide-react';

export default function DocumentsPage() {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost/hrms-backend/employees.php');
        const employees = await res.json();
        if (Array.isArray(employees) && employees.length > 0) setEmployeeId(employees[0].id);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading documents...</p>
      </div>
    </div>
  );

  if (!employeeId) return (
    <div className="flex items-center justify-center h-64">
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-orange-500" />
        </div>
        <p className="text-slate-700 font-semibold">No employee found</p>
        <p className="text-sm text-slate-400 mt-1">Please create an employee profile first</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Management</h1>
          <p className="text-sm text-slate-500 mt-1">Upload and manage certificates, degrees, identity proofs, and other files</p>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Employee Documents</h2>
              <p className="text-white/70 text-xs mt-0.5">Secure document storage and management</p>
            </div>
          </div>
        </div>
      </div>

      <FileUpload employeeId={employeeId} onUploadComplete={() => setRefreshTrigger(p => p + 1)} />
      <FileList employeeId={employeeId} refreshTrigger={refreshTrigger} />
    </div>
  );
}
