'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { certificationsArraySchema, CertificationsArrayFormData } from '@/lib/validations/certification';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2, Save, Upload, Eye, FileText, Link2, CheckCircle2 } from 'lucide-react';
import { Certification } from '@/lib/types';

export function CertificationsForm({
  defaultValues = [],
  onSubmit,
}: {
  defaultValues?: Certification[];
  onSubmit: (data: Certification[], files: Record<string, File>) => void;
}) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [fileNames, setFileNames] = useState<Record<number, string>>({});

  const initial: Certification[] = defaultValues.length > 0
    ? defaultValues
    : [{
        id: Date.now().toString(),
        certificationName: '',
        issuingOrganization: '',
        issueDate: new Date(),
        expiryDate: undefined,
        doesNotExpire: false,
        certificateNumber: '',
        credentialUrl: '',
      }];

  const form = useForm<CertificationsArrayFormData>({
    resolver: zodResolver(certificationsArraySchema),
    defaultValues: { certifications: initial },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'certifications',
  });

  const handleAdd = () =>
    append({
      id: Date.now().toString(),
      certificationName: '',
      issuingOrganization: '',
      issueDate: new Date(),
      expiryDate: undefined,
      doesNotExpire: false,
      certificateNumber: '',
      credentialUrl: '',
    });

  const handleFileChange = (index: number, file: File | null) => {
    const fileKey = `cert_${index}`;
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [fileKey]: file }));
      setFileNames((prev) => ({ ...prev, [index]: file.name }));
    } else {
      setUploadedFiles((prev) => {
        const updated = { ...prev };
        delete updated[fileKey];
        return updated;
      });
      setFileNames((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }
  };

  const handleSubmit = (data: CertificationsArrayFormData) => {
    const certifications = data.certifications.map((c) => ({
      ...c,
      issueDate: new Date(c.issueDate),
      // Force expiryDate to undefined when doesNotExpire is checked
      expiryDate: c.doesNotExpire ? undefined : (c.expiryDate ? new Date(c.expiryDate) : undefined),
      credentialUrl: c.credentialUrl || undefined,
    }));
    onSubmit(certifications, uploadedFiles);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Professional Certifications</h3>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Certification
          </button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {fields.map((field, index) => {
            const existingFilePath = form.watch(`certifications.${index}.documentFilePath`);
            const doesNotExpire = form.watch(`certifications.${index}.doesNotExpire`);

            return (
              <div
                key={field.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="h-0.5 bg-blue-600" />
                <div className="p-5">

                  {/* Card header: name label + remove button */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      {form.watch(`certifications.${index}.certificationName`) ||
                        `Certification ${index + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>

                  {/* Row 1: Cert Name + Issuing Org */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.certificationName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="field-label">Certification Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="AWS Solutions Architect" className="field-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.issuingOrganization`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="field-label">Issuing Organization *</FormLabel>
                          <FormControl>
                            <Input placeholder="Amazon Web Services" className="field-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 2: Certificate Number + Credential URL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.certificateNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="field-label">Certificate / Credential ID</FormLabel>
                          <FormControl>
                            <Input placeholder="CERT-123456" className="field-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.credentialUrl`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="field-label flex items-center gap-1">
                            <Link2 className="w-3 h-3" /> Credential URL
                            <span className="normal-case font-normal text-slate-400">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://www.credly.com/badges/..."
                              className="field-input"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 3: Issue Date + Expiry Date + Does Not Expire checkbox */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.issueDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="field-label">Issue Date *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="field-input"
                              {...field}
                              value={
                                field.value instanceof Date
                                  ? field.value.toISOString().split('T')[0]
                                  : (field.value as string) || ''
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Expiry Date column — with "Does Not Expire" checkbox stacked below */}
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name={`certifications.${index}.expiryDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={`field-label ${doesNotExpire ? 'text-slate-400' : ''}`}>
                              Expiry Date
                              <span className="normal-case font-normal text-slate-400 ml-1">(optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                disabled={!!doesNotExpire}
                                className={`field-input transition-opacity ${
                                  doesNotExpire
                                    ? 'opacity-40 cursor-not-allowed bg-slate-100'
                                    : ''
                                }`}
                                {...field}
                                value={
                                  doesNotExpire
                                    ? ''
                                    : field.value instanceof Date
                                    ? field.value.toISOString().split('T')[0]
                                    : (field.value as string) || ''
                                }
                                onChange={(e) => {
                                  if (!doesNotExpire) field.onChange(e);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Does Not Expire checkbox */}
                      <FormField
                        control={form.control}
                        name={`certifications.${index}.doesNotExpire`}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                            <input
                              type="checkbox"
                              checked={!!field.value}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                                // Clear expiry date when checking
                                if (e.target.checked) {
                                  form.setValue(`certifications.${index}.expiryDate`, '' as any);
                                }
                              }}
                              className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600"
                            />
                            <span className="text-xs font-medium text-slate-600">
                              Does Not Expire
                            </span>
                          </label>
                        )}
                      />
                    </div>
                  </div>

                  {/* Row 4: File Upload + View / Verified badge */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.documentFile`}
                      render={() => (
                        <FormItem>
                          <FormLabel className="field-label">Upload Certificate Document</FormLabel>
                          <div className="flex flex-wrap items-center gap-2">

                            {/* Choose file button */}
                            <label className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm text-slate-600">
                              <Upload className="w-4 h-4 text-slate-500 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {fileNames[index] || 'Choose file'}
                              </span>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  handleFileChange(index, file);
                                }}
                              />
                            </label>

                            {/* View Document button — only if file already saved */}
                            {existingFilePath && (
                              <a
                                href={`http://localhost/hrms-backend/${existingFilePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </a>
                            )}

                            {/* "Uploaded / Verified Document" badge — only if file path exists */}
                            {existingFilePath && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                Uploaded / Verified Document
                              </span>
                            )}
                          </div>

                          {/* Newly selected file name */}
                          {fileNames[index] && (
                            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {fileNames[index]}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                </div>
              </div>
            );
          })}

          {/* Form actions */}
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => form.reset()} className="btn-secondary">
              Reset
            </button>
            <button type="submit" className="btn-primary">
              <Save className="w-3.5 h-3.5" /> Save Certifications
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
