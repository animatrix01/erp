'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { identitySchema, IdentityFormData } from '@/lib/validations/identity';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Save, CheckCircle2, Loader2 } from 'lucide-react';

type DocumentStatus = 'missing' | 'pending' | 'verified';

// Maps the field name prefix to the documentType string the PATCH endpoint expects
type DocKey = 'aadhar' | 'pan' | 'voterId' | 'drivingLicense' | 'passport';

export function IdentityForm({
  defaultValues,
  onSubmit,
  onVerify,
}: {
  defaultValues?: Partial<IdentityFormData>;
  onSubmit: (data: IdentityFormData, files: Record<string, File>) => void;
  /** Called when admin clicks Verify. Returns true on API success. */
  onVerify?: (documentType: DocKey) => Promise<boolean>;
}) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  // Tracks which doc key is mid-verify call to show a spinner
  const [verifyingDoc, setVerifyingDoc] = useState<DocKey | null>(null);

  const form = useForm<IdentityFormData>({
    resolver: zodResolver(identitySchema),
    defaultValues: defaultValues || {
      aadharNumber:          '',
      panNumber:             '',
      passportNumber:        '',
      passportExpiryDate:    undefined,
      drivingLicenseNumber:  '',
      voterId:               '',
      aadharStatus:          'missing',
      panStatus:             'missing',
      passportStatus:        'missing',
      voterIdStatus:         'missing',
      drivingLicenseStatus:  'missing',
    },
    mode: 'onBlur',
  });

  const handleFileChange = (fieldName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [fieldName]: file }));
      // Auto-set status → pending when a new file is selected
      const statusField = (fieldName.replace('File', 'Status')) as keyof IdentityFormData;
      form.setValue(statusField, 'pending' as any);
    }
  };

  const handleVerifyClick = async (docKey: DocKey) => {
    if (!onVerify || verifyingDoc) return;
    setVerifyingDoc(docKey);
    const ok = await onVerify(docKey);
    if (ok) {
      // Optimistic update — flip badge to Verified immediately
      const statusField = `${docKey}Status` as keyof IdentityFormData;
      form.setValue(statusField, 'verified' as any);
    }
    setVerifyingDoc(null);
  };

  const handleFormSubmit = (data: IdentityFormData) => {
    onSubmit(data, uploadedFiles);
  };

  // ── Badge + optional Verify button ─────────────────────────────────────────
  const StatusBadge = ({ status, docKey }: { status: DocumentStatus; docKey: DocKey }) => {
    const badgeStyles: Record<DocumentStatus, string> = {
      missing:  'bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold',
      pending:  'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold',
      verified: 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold',
    };
    const labels: Record<DocumentStatus, string> = {
      missing:  'Missing',
      pending:  'Pending',
      verified: 'Verified',
    };

    return (
      <div className="flex items-center gap-2">
        <span className={badgeStyles[status]}>{labels[status]}</span>

        {/* Verify button — only rendered when status is 'pending' AND onVerify prop is provided */}
        {status === 'pending' && onVerify && (
          <button
            type="button"
            disabled={verifyingDoc === docKey}
            onClick={() => handleVerifyClick(docKey)}
            className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold rounded transition-colors"
            title="Mark as Verified"
          >
            {verifyingDoc === docKey ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3 h-3" />
            )}
            Verify
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-0.5 bg-blue-600" />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Government Issued IDs</h3>
              <p className="text-xs text-slate-400 mt-0.5">Upload documents for verification</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">

              {/* ── AADHAR CARD ── */}
              <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700 uppercase">Aadhar Card</h4>
                  <StatusBadge status={(form.watch('aadharStatus') || 'missing') as DocumentStatus} docKey="aadhar" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="aadharNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">Aadhar Number</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789012" maxLength={12} className="field-input" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Upload Document</label>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange('aadharFile', e)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">View</label>
                    {form.watch('aadharFilePath') ? (
                      <a href={`http://localhost/hrms-backend/${form.watch('aadharFilePath')}`} target="_blank" rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">
                        View Document
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No file uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── PAN CARD ── */}
              <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700 uppercase">PAN Card</h4>
                  <StatusBadge status={(form.watch('panStatus') || 'missing') as DocumentStatus} docKey="pan" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="panNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">PAN Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ABCDE1234F" maxLength={10} className="field-input" {...field} value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Upload Document</label>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange('panFile', e)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">View</label>
                    {form.watch('panFilePath') ? (
                      <a href={`http://localhost/hrms-backend/${form.watch('panFilePath')}`} target="_blank" rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">
                        View Document
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No file uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── VOTER ID ── */}
              <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700 uppercase">Voter ID</h4>
                  <StatusBadge status={(form.watch('voterIdStatus') || 'missing') as DocumentStatus} docKey="voterId" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="voterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">Voter ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC1234567" className="field-input" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Upload Document</label>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange('voterIdFile', e)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">View</label>
                    {form.watch('voterIdFilePath') ? (
                      <a href={`http://localhost/hrms-backend/${form.watch('voterIdFilePath')}`} target="_blank" rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">
                        View Document
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No file uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── DRIVING LICENSE ── */}
              <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700 uppercase">Driving License</h4>
                  <StatusBadge status={(form.watch('drivingLicenseStatus') || 'missing') as DocumentStatus} docKey="drivingLicense" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="drivingLicenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="DL1234567890123" className="field-input" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Upload Document</label>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange('drivingLicenseFile', e)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">View</label>
                    {form.watch('drivingLicenseFilePath') ? (
                      <a href={`http://localhost/hrms-backend/${form.watch('drivingLicenseFilePath')}`} target="_blank" rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">
                        View Document
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No file uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── PASSPORT ── */}
              <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700 uppercase">Passport</h4>
                  <StatusBadge status={(form.watch('passportStatus') || 'missing') as DocumentStatus} docKey="passport" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField control={form.control} name="passportNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">Passport Number</FormLabel>
                        <FormControl>
                          <Input placeholder="A1234567" className="field-input" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  <FormField control={form.control} name="passportExpiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" className="field-input" {...field}
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (field.value as string) || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Upload Document</label>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange('passportFile', e)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">View</label>
                    {form.watch('passportFilePath') ? (
                      <a href={`http://localhost/hrms-backend/${form.watch('passportFilePath')}`} target="_blank" rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">
                        View Document
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No file uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Submit ── */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button type="button" onClick={() => form.reset()}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 font-semibold">
                  Reset
                </button>
                <button type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">
                  <Save className="w-4 h-4" /> Save Identity Documents
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
