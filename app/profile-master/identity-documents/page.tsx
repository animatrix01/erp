'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { IdentityForm } from '@/components/custom/identity-form';
import { IdentityFormData } from '@/lib/validations/identity';
import { Toast } from '@/components/ui/toast';
import { ArrowLeft } from 'lucide-react';

type DocKey = 'aadhar' | 'pan' | 'voterId' | 'drivingLicense' | 'passport';

function mapIdentityFromApi(data: Record<string, unknown> | null) {
  if (!data) return undefined;
  return {
    aadharNumber:          (data.aadharNumber          as string) || '',
    panNumber:             (data.panNumber             as string) || '',
    passportNumber:        (data.passportNumber        as string) || '',
    passportExpiryDate:    data.passportExpiryDate || undefined,
    drivingLicenseNumber:  (data.drivingLicenseNumber  as string) || '',
    voterId:               (data.voterId               as string) || '',
    aadharFilePath:        (data.aadharFilePath        as string) || '',
    panFilePath:           (data.panFilePath           as string) || '',
    passportFilePath:      (data.passportFilePath      as string) || '',
    voterIdFilePath:       (data.voterIdFilePath       as string) || '',
    drivingLicenseFilePath:(data.drivingLicenseFilePath as string) || '',
    aadharStatus:         (data.aadharStatus         as any) || 'missing',
    panStatus:            (data.panStatus            as any) || 'missing',
    passportStatus:       (data.passportStatus       as any) || 'missing',
    voterIdStatus:        (data.voterIdStatus        as any) || 'missing',
    drivingLicenseStatus: (data.drivingLicenseStatus as any) || 'missing',
  };
}

export default function IdentityDocumentsPage() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id');
  const backHref = idFromUrl ? `/profile-master?id=${idFromUrl}` : '/profile-master';
  const [identity, setIdentity]     = useState<any>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading]       = useState(true);
  const [showToast, setShowToast]   = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const toast = (msg: string) => { setToastMessage(msg); setShowToast(true); };

  const loadIdentity = async (empId: string) => {
    const iRes  = await fetch(`http://localhost/hrms-backend/identity_documents.php?employeeId=${empId}`);
    const iData = await iRes.json();
    setIdentity(mapIdentityFromApi(iData));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res       = await fetch('http://localhost/hrms-backend/employees.php');
        const employees = await res.json();
        if (Array.isArray(employees) && employees.length > 0) {
          const emp = employees[0];
          setEmployeeId(emp.id);
          await loadIdentity(emp.id);
        }
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Targeted verify: PATCH a single document status to "verified" ──────────
  const handleVerify = async (documentType: DocKey): Promise<boolean> => {
    if (!employeeId) { toast('No employee loaded'); return false; }
    try {
      const res = await fetch('http://localhost/hrms-backend/identity_documents.php', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ employeeId, documentType, action: 'verify' }),
      });
      if (res.ok) {
        toast(`Document verified successfully`);
        return true;
      }
      const err = await res.json();
      console.error('Verify error:', err);
      toast('Failed to verify document');
      return false;
    } catch (error) {
      console.error('Verify error:', error);
      toast('An error occurred while verifying');
      return false;
    }
  };

  // ── Full form save ─────────────────────────────────────────────────────────
  const handleSubmit = async (data: IdentityFormData, files: Record<string, File>) => {
    if (!employeeId) { toast('Please save employee profile first'); return; }

    try {
      const formData = new FormData();
      formData.append('employeeId', employeeId);

      if (data.aadharNumber)        formData.append('aadharNumber',        data.aadharNumber);
      if (data.panNumber)           formData.append('panNumber',           data.panNumber);
      if (data.passportNumber)      formData.append('passportNumber',      data.passportNumber);
      if (data.passportExpiryDate) {
        const dateStr = data.passportExpiryDate instanceof Date
          ? data.passportExpiryDate.toISOString().split('T')[0]
          : data.passportExpiryDate;
        formData.append('passportExpiryDate', dateStr);
      }
      if (data.drivingLicenseNumber) formData.append('drivingLicenseNumber', data.drivingLicenseNumber);
      if (data.voterId)              formData.append('voterId',              data.voterId);

      formData.append('aadharStatus',         data.aadharStatus         || 'missing');
      formData.append('panStatus',            data.panStatus            || 'missing');
      formData.append('passportStatus',       data.passportStatus       || 'missing');
      formData.append('voterIdStatus',        data.voterIdStatus        || 'missing');
      formData.append('drivingLicenseStatus', data.drivingLicenseStatus || 'missing');

      if (files.aadharFile)         formData.append('aadharFile',        files.aadharFile);
      if (files.panFile)            formData.append('panFile',           files.panFile);
      if (files.passportFile)       formData.append('passportFile',      files.passportFile);
      if (files.voterIdFile)        formData.append('voterIdFile',       files.voterIdFile);
      if (files.drivingLicenseFile) formData.append('drivingLicenseFile',files.drivingLicenseFile);

      const res = await fetch('http://localhost/hrms-backend/identity_documents.php', {
        method: 'POST',
        body:   formData,
      });

      if (res.ok) {
        toast('Identity documents saved successfully');
        await loadIdentity(employeeId);
      } else {
        const error = await res.json();
        console.error('Save error:', error);
        toast('Failed to save identity documents');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast('An error occurred while saving');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5 animate-in">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Identity Documents</h1>
            <p className="text-xs text-slate-500">
              Aadhar, PAN, Passport, Driving License &amp; document uploads
            </p>
          </div>
        </div>

        <IdentityForm
          defaultValues={identity}
          onSubmit={handleSubmit}
          onVerify={handleVerify}
        />
      </div>

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}


