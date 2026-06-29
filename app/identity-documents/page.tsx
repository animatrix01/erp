'use client';

import { useEffect, useState } from 'react';
import { IdentityForm } from '@/components/custom/identity-form';
import { FileUpload } from '@/components/custom/file-upload';
import { FileList } from '@/components/custom/file-list';
import { Toast } from '@/components/ui/toast';
import { CreditCard, FolderOpen } from 'lucide-react';

function mapIdentityFromApi(data: Record<string, unknown> | null) {
  if (!data) return undefined;
  return {
    aadharNumber: (data.aadharNumber as string) || '',
    panNumber: (data.panNumber as string) || '',
    passportNumber: (data.passportNumber as string) || '',
    passportExpiryDate: data.passportExpiryDate || undefined,
    drivingLicenseNumber: (data.drivingLicenseNumber as string) || '',
    voterId: (data.voterId as string) || '',
    aadharVerified: Boolean(data.aadharVerified),
    panVerified: Boolean(data.panVerified),
    passportVerified: Boolean(data.passportVerified),
    voterIdVerified: Boolean(data.voterIdVerified),
    drivingLicenseVerified: Boolean(data.drivingLicenseVerified),
  };
}

function identityToPayload(data: Record<string, unknown>) {
  return {
    ...data,
    passportExpiryDate: data.passportExpiryDate instanceof Date
      ? data.passportExpiryDate.toISOString().split('T')[0]
      : data.passportExpiryDate || null,
    aadharVerified: Boolean(data.aadharVerified),
    panVerified: Boolean(data.panVerified),
    passportVerified: Boolean(data.passportVerified),
    voterIdVerified: Boolean(data.voterIdVerified),
    drivingLicenseVerified: Boolean(data.drivingLicenseVerified),
  };
}

export default function IdentityDocumentsPage() {
  const [identity, setIdentity] = useState<any>(null);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost/hrms-backend/employees.php');
        const employees = await res.json();
        if (Array.isArray(employees) && employees.length > 0) {
          const emp = employees[0];
          setEmployeeId(emp.id);
          const r = await fetch(`http://localhost/hrms-backend/identity_documents.php?employeeId=${emp.id}`);
          const iData = await r.json();
          setIdentity(mapIdentityFromApi(iData));
        }
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch('http://localhost/hrms-backend/employees.php');
      const employees = await res.json();
      if (!Array.isArray(employees) || employees.length === 0) {
        setToastMessage('Please create an employee profile first');
        setShowToast(true);
        return;
      }
      const r = await fetch('http://localhost/hrms-backend/identity_documents.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employees[0].id, ...identityToPayload(data) }),
      });
      if (r.ok) { setIdentity(data); setToastMessage('Identity documents saved!'); }
      else { const e = await r.json(); setToastMessage(`Error: ${e.error || 'Failed to save'}`); }
      setShowToast(true);
    } catch { setToastMessage('Failed to save'); setShowToast(true); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6 animate-in">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Identity & Documents</h1>
          <p className="text-sm text-slate-500 mt-1">Manage government IDs, passport info, and upload supporting documents</p>
        </div>

        {/* Identity section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Identity Documents</h2>
          </div>
          <IdentityForm defaultValues={identity} onSubmit={handleSubmit} />
        </div>

        {/* Documents section */}
        {employeeId && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Document Management</h2>
            </div>
            <div className="space-y-4">
              <FileUpload employeeId={employeeId} onUploadComplete={() => setRefreshTrigger(p => p + 1)} />
              <FileList employeeId={employeeId} refreshTrigger={refreshTrigger} />
            </div>
          </div>
        )}
      </div>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
