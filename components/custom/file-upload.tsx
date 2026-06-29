'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

interface FileUploadProps {
  employeeId: string;
  onUploadComplete?: () => void;
}

export function FileUpload({ employeeId, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState<string>('other');
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('employeeId', employeeId);
      formData.append('uploadedBy', employeeId);
      formData.append('fileType', fileType);
      const res = await fetch('http://localhost/hrms-backend/upload.php', { method: 'POST', body: formData });
      if (res.ok) {
        setMessage({ text: `${file.name} uploaded successfully!`, ok: true });
        onUploadComplete?.();
      } else {
        const e = await res.json();
        setMessage({ text: e.error || 'Upload failed', ok: false });
      }
    } catch {
      setMessage({ text: 'Upload failed. Please try again.', ok: false });
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { await uploadFile(file); e.target.value = ''; }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Upload className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-slate-800">Upload Documents</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Document type */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Document Type *</label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aadhar">Aadhar Card</SelectItem>
                <SelectItem value="pan">PAN Card</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="degree">Degree / Diploma</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="medical">Medical Document</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Drop zone */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Choose File</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload-input')?.click()}
              className={`h-10 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all text-sm font-semibold
                ${dragOver ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50 text-slate-500'}
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Click or drag file here'}
            </div>
            <input id="file-upload-input" type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" onChange={handleFileInput} disabled={uploading} className="hidden" />
            <p className="text-xs text-slate-400 mt-1">JPG, PNG, PDF, DOC, DOCX · Max 10MB</p>
          </div>
        </div>

        {message && (
          <div className={`mt-4 flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${message.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.ok ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
