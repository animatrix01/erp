'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ProfileForm } from '@/components/custom/profile-form';
import { ContactForm } from '@/components/custom/contact-form';
import { AddressForm } from '@/components/custom/address-form';
import { ProfileFormData } from '@/lib/validations/profile';
import { ContactFormData } from '@/lib/validations/contact';
import { Profile } from '@/lib/types';
import { Toast } from '@/components/ui/toast';
import { ArrowLeft } from 'lucide-react';

function mapEmployeeToProfile(emp: Record<string, unknown>): Profile {
  return {
    employeeId: emp.employeeId as string,
    firstName: emp.firstName as string,
    middleName: (emp.middleName as string) || '',
    lastName: emp.lastName as string,
    displayName: (emp.displayName as string) || '',
    email: emp.email as string,
    phone: emp.phone as string,
    alternatePhone: (emp.alternatePhone as string) || '',
    personalEmail: (emp.personalEmail as string) || '',
    officeExtension: (emp.officeExtension as string) || '',
    fax: (emp.fax as string) || '',
    dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth as string) : new Date(),
    gender: emp.gender as Profile['gender'],
    maritalStatus: (emp.maritalStatus as string) || '',
    nationality: (emp.nationality as string) || 'Indian',
    religion: (emp.religion as string) || '',
    category: (emp.category as string) || '',
    bloodGroup: emp.bloodGroup as string,
    languagesKnown: (emp.languagesKnown as string) || '',
    permanentSameAsCurrent: Boolean(emp.permanentSameAsCurrent),
    role:          (emp.role        as string) || '',
    designation:   (emp.designation as string) || '',
    department:    (emp.department  as string) || '',
    dateOfJoining: (emp.dateOfJoining as string) || '',
  };
}

function profileToPayload(profile: Profile, extra?: Record<string, unknown>) {
  return {
    employeeId: profile.employeeId,
    role:          profile.role        || null,
    designation:   profile.designation || null,
    department:    profile.department  || null,
    dateOfJoining: profile.dateOfJoining || null,
    firstName: profile.firstName,
    middleName: profile.middleName || null,
    lastName: profile.lastName,
    displayName: profile.displayName || null,
    email: profile.email,
    phone: profile.phone,
    alternatePhone: profile.alternatePhone || null,
    personalEmail: profile.personalEmail || null,
    officeExtension: profile.officeExtension || null,
    fax: profile.fax || null,
    dateOfBirth: (profile.dateOfBirth instanceof Date
      ? profile.dateOfBirth
      : new Date(profile.dateOfBirth as string)
    ).toISOString().split('T')[0],
    gender: profile.gender,
    maritalStatus: profile.maritalStatus || null,
    nationality: profile.nationality || 'Indian',
    religion: profile.religion || null,
    category: profile.category || null,
    bloodGroup: profile.bloodGroup,
    languagesKnown: profile.languagesKnown || null,
    permanentSameAsCurrent: profile.permanentSameAsCurrent ? 1 : 0,
    ...extra,
  };
}

export default function BasicInformationPage() {
  const searchParams = useSearchParams();
  const employeeIdFromUrl = searchParams.get('id'); // UUID passed from employee directory

  const [profile, setProfile] = useState<Profile | null>(null);
  const [employeeDbId, setEmployeeDbId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const toast = (msg: string) => { setToastMessage(msg); setShowToast(true); };

  useEffect(() => {
    const load = async () => {
      try {
        // No id in URL = Create Mode, render blank form immediately
        if (!employeeIdFromUrl) {
          setLoading(false);
          return;
        }

        // Edit Mode — load specific employee by UUID
        setEmployeeDbId(employeeIdFromUrl);

        const fullRes = await fetch(`http://localhost/hrms-backend/employees.php?id=${employeeIdFromUrl}`);
        const emp = await fullRes.json();

        setProfile(mapEmployeeToProfile(emp));
        if (emp.photoUrl) setPhotoUrl(emp.photoUrl);

        const aRes = await fetch(`http://localhost/hrms-backend/addresses.php?employeeId=${employeeIdFromUrl}`);
        const aData = await aRes.json();
        setAddresses(Array.isArray(aData) ? aData : []);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [employeeIdFromUrl]);

  const handlePhotoUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', 'photo');
    // Pass the DB UUID (id) so upload.php can update employees.photo_url directly
    if (employeeDbId) formData.append('employeeId', employeeDbId);
    const res = await fetch('http://localhost/hrms-backend/upload.php', { method: 'POST', body: formData });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error ?? `Upload failed (HTTP ${res.status})`);
    }
    const data = await res.json();
    if (data.warning) console.warn('Photo upload warning:', data.warning);
    // Store relative path in state (component builds full URL itself)
    setPhotoUrl(data.url);
    toast('Photo uploaded!');
    return data.url;
  };

  const handleProfileSubmit = async (data: ProfileFormData) => {
    try {
      // CREATE MODE — no existing employee
      if (!employeeDbId) {
        const payload = {
          ...data,
          dateOfBirth: new Date(data.dateOfBirth).toISOString().split('T')[0],
          photoUrl: photoUrl || undefined,
        };
        const res = await fetch('http://localhost/hrms-backend/employees.php', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast('Profile created!');
          // Fetch the newly created employee to get their UUID
          const listRes = await fetch('http://localhost/hrms-backend/employees.php');
          const emps = await listRes.json();
          if (Array.isArray(emps) && emps.length > 0) {
            const newest = emps[emps.length - 1];
            setEmployeeDbId(newest.id);
            setProfile(mapEmployeeToProfile(newest));
            if (newest.photoUrl) setPhotoUrl(newest.photoUrl);
            // Update URL to edit mode without full page reload
            window.history.replaceState(null, '', `/profile-master/basic-information?id=${newest.id}`);
          }
        } else {
          const errBody = await res.json().catch(() => ({}));
          toast(`Failed to save: ${errBody.error ?? res.status}`);
        }
        return;
      }

      // EDIT MODE — update existing employee
      const updatedProfile: Profile = {
        ...profile!,
        ...data,
        dateOfBirth: data.dateOfBirth
          ? (data.dateOfBirth instanceof Date ? data.dateOfBirth : new Date(data.dateOfBirth as string))
          : profile!.dateOfBirth,
      };

      const res = await fetch(`http://localhost/hrms-backend/employees.php?id=${employeeDbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileToPayload(updatedProfile, { photoUrl: photoUrl || undefined })),
      });

      if (res.ok) {
        setProfile(updatedProfile);
        toast('Profile updated!');
      } else {
        const errBody = await res.json().catch(() => ({}));
        toast(`Failed to update: ${errBody.error ?? res.status}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast('An error occurred while saving');
    }
  };

  const handleContactSubmit = async (data: ContactFormData) => {
    if (!profile || !employeeDbId) { toast('Save profile first'); return; }
    try {
      const updatedProfile: Profile = { ...profile, ...data };
      const res = await fetch(`http://localhost/hrms-backend/employees.php?id=${employeeDbId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileToPayload(updatedProfile, { photoUrl: photoUrl || undefined })),
      });
      if (res.ok) {
        setProfile(updatedProfile);
        toast('Contact information saved!');
      } else toast('Failed to save contact');
    } catch { toast('Failed to save contact'); }
  };

  const handleAddressSubmit = async (data: any[], permanentSameAsCurrent: boolean) => {
    if (!employeeDbId || !profile) { toast('Save profile first'); return; }
    try {
      const addressRes = await fetch('http://localhost/hrms-backend/addresses_batch.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeDbId, addresses: data }),
      });
      if (!addressRes.ok) { toast('Failed to save addresses'); return; }

      const updatedProfile: Profile = { ...profile, permanentSameAsCurrent };
      const empRes = await fetch(`http://localhost/hrms-backend/employees.php?id=${employeeDbId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileToPayload(updatedProfile, { photoUrl: photoUrl || undefined })),
      });

      if (empRes.ok) {
        setAddresses(data);
        setProfile(updatedProfile);
        toast('Addresses saved!');
      } else toast('Addresses saved but preference failed to update');
    } catch { toast('Failed to save addresses'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <div className="space-y-6 animate-in">
        {/* Back nav */}
        <div className="flex items-center gap-3">
          <Link href={employeeIdFromUrl ? `/profile-master?id=${employeeIdFromUrl}` : '/profile-master'}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Basic Information</h1>
            <p className="text-xs text-slate-500">Personal details, contact info, profile photo & addresses</p>
          </div>
        </div>

        {/* Profile form */}
        <ProfileForm
          defaultValues={profile ? {
            ...profile,
            dateOfBirth: profile.dateOfBirth
                ? (profile.dateOfBirth instanceof Date
                    ? profile.dateOfBirth
                    : new Date(profile.dateOfBirth as string)
                  ).toISOString().split('T')[0] as any
                : '' as any,
          } : undefined}
          photoUrl={photoUrl}
          onPhotoUpload={handlePhotoUpload}
          onSubmit={handleProfileSubmit}
          onValidationError={(msg) => toast(msg)}
          onUploadError={(msg) => toast(msg)}
        />

        <ContactForm
          defaultValues={profile ? {
            alternatePhone: profile.alternatePhone,
            personalEmail: profile.personalEmail,
            officeExtension: profile.officeExtension,
            fax: profile.fax,
          } : undefined}
          onSubmit={handleContactSubmit}
        />

        {/* Address section */}
        <AddressForm
          defaultValues={addresses}
          permanentSameAsCurrent={profile?.permanentSameAsCurrent}
          onSubmit={handleAddressSubmit}
        />
      </div>

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
