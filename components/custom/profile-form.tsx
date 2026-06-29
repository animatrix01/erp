'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '@/lib/validations/profile';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, User, Save, Camera, Check, Loader2 } from 'lucide-react';

// ── Constant: XAMPP backend base URL ─────────────────────────────────────────
const BACKEND = 'http://localhost/hrms-backend/';

/** Ensure a photo path (relative or absolute) is always a full URL. */
function toPhotoSrc(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return BACKEND + path;
}

interface ProfileFormProps {
  defaultValues?: Partial<ProfileFormData>;
  photoUrl?: string;
  onSubmit: (data: ProfileFormData) => void;
  onPhotoUpload?: (file: File) => Promise<string>;
  /** Called when the user clicks Save but Zod validation fails */
  onValidationError?: (message: string) => void;
  /** Called when photo upload throws (so parent can show Toast) */
  onUploadError?: (message: string) => void;
}

export function ProfileForm({
  defaultValues,
  photoUrl,
  onSubmit,
  onPhotoUpload,
  onValidationError,
  onUploadError,
}: ProfileFormProps) {
  const [uploading, setUploading] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(photoUrl);
  const [isSaved, setIsSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Re-populate form when async defaultValues arrive from the parent ──────
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      form.reset(defaultValues);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  // ── Sync photo URL when parent loads it from DB ───────────────────────────
  useEffect(() => {
    if (photoUrl) setCurrentPhotoUrl(photoUrl);
  }, [photoUrl]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultValues || {
      employeeId: '', firstName: '', middleName: '', lastName: '', displayName: '',
      email: '', phone: '', gender: 'male', maritalStatus: '', nationality: 'Indian',
      religion: '', category: '', bloodGroup: '', languagesKnown: '',
      role: '', designation: '', department: '', dateOfJoining: '',
    },
    mode: 'onBlur',
  });

  // ── onError: called by react-hook-form when Zod validation fails ─────────
  const handleError = () => {
    const errors = form.formState.errors;
    const messages = Object.values(errors)
      .map((e) => (e as any)?.message)
      .filter(Boolean)
      .slice(0, 3)
      .join(' • ');

    const summary = messages
      ? `Please fix: ${messages}`
      : 'Please fill all required fields correctly';

    onValidationError?.(summary);
  };

  // ── Wrap onSubmit to drive the isSaved pulse ──────────────────────────────
  const handleSubmit = async (data: ProfileFormData) => {
    await onSubmit(data);
    setIsSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setIsSaved(false), 3000);
  };

  // ── Photo upload ──────────────────────────────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onPhotoUpload) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      onUploadError?.('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.('Image must be under 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const relPath = await onPhotoUpload(file);
      // Always display using full backend URL
      setCurrentPhotoUrl(toPhotoSrc(relPath));
    } catch (err: any) {
      onUploadError?.(err?.message ?? 'Photo upload failed. Check the console for details.');
    } finally {
      setUploading(false);
    }
  };

  // Resolve display URL at render time (covers initial load from DB)
  const displayPhotoUrl = toPhotoSrc(currentPhotoUrl ?? photoUrl);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
        <p className="text-xs text-slate-400 mt-0.5">Core employee profile and contact details</p>
      </div>

      <Form {...form}>
        {/* Pass both onValid (handleSubmit) and onInvalid (handleError) */}
        <form onSubmit={form.handleSubmit(handleSubmit, handleError)} className="p-5 space-y-5">

          {/* ── Photo row ── */}
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
            <div className="flex-shrink-0">
              {displayPhotoUrl ? (
                <img
                  src={displayPhotoUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                  onError={(e) => {
                    // If the image 404s, fall back to the placeholder silently
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute('style');
                  }}
                />
              ) : null}
              {/* Placeholder — visible when no photo OR image load fails */}
              <div
                className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200"
                style={{ display: displayPhotoUrl ? 'none' : 'flex' }}
              >
                <User className="w-7 h-7 text-slate-400" />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Camera className="w-3 h-3" /> Profile Photo
              </p>
              <button
                type="button"
                disabled={uploading}
                onClick={() => document.getElementById('photo-upload')?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Upload className="w-3 h-3" />
                {uploading ? 'Uploading…' : displayPhotoUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
              <input
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <p className="text-xs text-slate-400 mt-1">JPG, PNG or WebP, max 5 MB</p>
            </div>
          </div>

          {/* ── Text fields ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              { name: 'employeeId'  as const, label: 'Employee ID *',   placeholder: 'EMP001' },
              { name: 'firstName'   as const, label: 'First Name *',    placeholder: 'John' },
              { name: 'middleName'  as const, label: 'Middle Name',     placeholder: 'Kumar' },
              { name: 'lastName'    as const, label: 'Last Name *',     placeholder: 'Doe' },
              { name: 'displayName' as const, label: 'Display Name',    placeholder: 'Dr. John K. Doe' },
              { name: 'email'       as const, label: 'Email Address *', placeholder: 'employee@college.edu', type: 'email' },
              { name: 'phone'       as const, label: 'Phone Number *',  placeholder: '+919876543210' },
              { name: 'dateOfBirth' as const, label: 'Date of Birth *', type: 'date' },
              { name: 'nationality' as const, label: 'Nationality',     placeholder: 'Indian' },
            ] as const).map((f) => (
              <FormField
                key={f.name}
                control={form.control}
                name={f.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="field-label">{f.label}</FormLabel>
                    <FormControl>
                      <Input
                        type={('type' in f ? f.type : undefined) || 'text'}
                        placeholder={'placeholder' in f ? f.placeholder : undefined}
                        className="field-input"
                        {...field}
                        value={
                          'type' in f && f.type === 'date' && field.value instanceof Date
                            ? field.value.toISOString().split('T')[0]
                            : (field.value as string) ?? ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            {/* Gender (required) */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="field-label">Gender *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="field-input">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Marital Status (optional) */}
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="field-label">Marital Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="field-input">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Religion (optional) */}
            <FormField
              control={form.control}
              name="religion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="field-label">Religion</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="field-input">
                        <SelectValue placeholder="Select religion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hindu">Hindu</SelectItem>
                      <SelectItem value="muslim">Muslim</SelectItem>
                      <SelectItem value="christian">Christian</SelectItem>
                      <SelectItem value="sikh">Sikh</SelectItem>
                      <SelectItem value="buddhist">Buddhist</SelectItem>
                      <SelectItem value="jain">Jain</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category (optional) */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="field-label">Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="field-input">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="obc">OBC</SelectItem>
                      <SelectItem value="obc-non-creamy">OBC (Non-Creamy)</SelectItem>
                      <SelectItem value="sc">SC</SelectItem>
                      <SelectItem value="st">ST</SelectItem>
                      <SelectItem value="ews">EWS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Blood Group (required) */}
            <FormField
              control={form.control}
              name="bloodGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="field-label">Blood Group *</FormLabel>
                  <FormControl>
                    <Input placeholder="O+" className="field-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Languages Known (optional) */}
            <FormField
              control={form.control}
              name="languagesKnown"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="field-label">Languages Known</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Odia, Hindi, English"
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

          {/* ── Job & Institutional Details ── */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Job &amp; Institutional Details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="field-label">Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Assistant Professor" className="field-input" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Designation */}
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="field-label">Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Lecturer" className="field-input" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="field-label">Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Computer Science" className="field-input" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Joining */}
              <FormField
                control={form.control}
                name="dateOfJoining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="field-label">Date of Joining</FormLabel>
                    <FormControl>
                      <Input type="date" className="field-input" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button type="button" onClick={() => form.reset()} className="btn-secondary">
              Reset
            </button>
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-70
                ${isSaved
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'btn-primary'
                }`}
            >
              {form.formState.isSubmitting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
              ) : isSaved ? (
                <><Check className="w-3.5 h-3.5" /> Saved Successfully</>
              ) : (
                <><Save className="w-3.5 h-3.5" /> Save Profile</>
              )}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
