'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Eye, FolderOpen } from 'lucide-react';

interface FileListProps {
  employeeId: string;
  refreshTrigger?: number;
}

const typeColors: Record<string, string> = {
  aadhar: 'bg-amber-100 text-amber-700', pan: 'bg-orange-100 text-orange-700',
  passport: 'bg-blue-100 text-blue-700', certificate: 'bg-emerald-100 text-emerald-700',
  degree: 'bg-indigo-100 text-indigo-700', photo: 'bg-violet-100 text-violet-700',
  medical: 'bg-rose-100 text-rose-700', other: 'bg-slate-100 text-slate-600',
};

const typeLabels: Record<string, string> = {
  aadhar: 'Aadhar Card', pan: 'PAN Card', passport: 'Passport',
  certificate: 'Certificate', degree: 'Degree', photo: 'Photo',
  medical: 'Medical', other: 'Other',
};

export function FileList({ employeeId, refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    try {
      const res = await fetch(`http://localhost/hrms-backend/files.php?employeeId=${employeeId}`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch { setFiles([]); } finally { setLoading(false); }
  };

  useEffect(() => { loadFiles(); }, [employeeId, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      const res = await fetch(`http://localhost/hrms-backend/files.php?id=${id}`, { method: 'DELETE' });
      if (res.ok) loadFiles();
    } catch { }
  };

  const fmt = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-500" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-slate-800">Uploaded Documents</h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{files.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400">No documents uploaded yet</p>
            <p className="text-xs text-slate-300 mt-0.5">Upload documents using the form above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all group">
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{file.fileName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[file.fileType] || typeColors.other}`}>
                      {typeLabels[file.fileType] || file.fileType}
                    </span>
                    <span className="text-xs text-slate-400">{fmt(file.fileSize)}</span>
                    <span className="text-xs text-slate-400">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <a href={file.filePath} target="_blank" rel="noopener noreferrer">
                    <button className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </a>
                  <a href={file.filePath} download={file.fileName}>
                    <button className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </a>
                  <button onClick={() => handleDelete(file.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
