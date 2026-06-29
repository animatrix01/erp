'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AddressForm } from '@/components/custom/address-form';
import { Toast } from '@/components/ui/toast';
import { ArrowLeft } from 'lucide-react';

export default function AddressInformationPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [permanentSameAsCurrent, setPermanentSameAsCurrent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost/hrms-backend/employees.php');
        const employees = await res.json();
        if (Array.isArray(employees) && employees.length > 0) {
          const emp = employees[0];
          setEmployeeId(emp.id);
          setPermanentSameAsCurrent(Boolean(emp.permanentSameAsCurrent));
          const aRes = await fetch(`http://localhost/hrms-backend/addresses.php?employeeId=${emp.id}`);
          const aData = await aRes.json();
          setAddresses(Array.isArray(aData) ? aData : []);
        }
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (data: any[], sameAsCurrent: boolean) => {
    if (!employeeId) { setToastMessage('Save profile first'); setShowToast(true); return; }
    try {
      const addressRes = await fetch('http://localhost/hrms-backend/addresses_batch.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, addresses: data }),
      });
      if (!addressRes.ok) {
        setToastMessage('Failed to save');
        setShowToast(true);
        return;
      }

      const empRes = await fetch(`http://localhost/hrms-backend/employees.php?id=${employeeId}`);
      const emp = await empRes.json();
      const updateRes = await fetch(`http://localhost/hrms-backend/employees.php?id=${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...emp,
          dateOfBirth: emp.dateOfBirth,
          permanentSameAsCurrent: sameAsCurrent,
        }),
      });

      if (updateRes.ok) {
        setAddresses(data);
        setPermanentSameAsCurrent(sameAsCurrent);
        setToastMessage('Addresses saved!');
      } else setToastMessage('Addresses saved but preference failed to update');
    } catch {
      setToastMessage('Failed to save');
    }
    setShowToast(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <div className="space-y-5 animate-in">
        <div className="flex items-center gap-3">
          <Link href="/profile-master" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Address Information</h1>
            <p className="text-xs text-slate-500">Permanent, current & correspondence addresses</p>
          </div>
        </div>
        <AddressForm
          defaultValues={addresses}
          permanentSameAsCurrent={permanentSameAsCurrent}
          onSubmit={handleSubmit}
        />
      </div>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
