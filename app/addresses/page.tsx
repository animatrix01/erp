'use client';

import { useEffect, useState } from 'react';
import { AddressForm } from '@/components/custom/address-form';
import { Toast } from '@/components/ui/toast';
import { MapPin, Home, Navigation } from 'lucide-react';

export default function AddressesPage() {
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
          const r = await fetch(`http://localhost/hrms-backend/addresses.php?employeeId=${emp.id}`);
          const data = await r.json();
          setAddresses(Array.isArray(data) ? data : []);
        }
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (data: any[], sameAsCurrent: boolean) => {
    try {
      if (!employeeId) {
        setToastMessage('Please create an employee profile first');
        setShowToast(true);
        return;
      }

      const r = await fetch('http://localhost/hrms-backend/addresses_batch.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeId, addresses: data }),
      });
      if (!r.ok) {
        const e = await r.json();
        setToastMessage(`Error: ${e.error || 'Failed to save'}`);
        setShowToast(true);
        return;
      }

      const empRes = await fetch(`http://localhost/hrms-backend/employees.php?id=${employeeId}`);
      const emp = await empRes.json();
      await fetch(`http://localhost/hrms-backend/employees.php?id=${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emp, dateOfBirth: emp.dateOfBirth, permanentSameAsCurrent: sameAsCurrent }),
      });

      setAddresses(data);
      setPermanentSameAsCurrent(sameAsCurrent);
      setToastMessage('Addresses saved successfully!');
      setShowToast(true);
    } catch { setToastMessage('Failed to save addresses'); setShowToast(true); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading addresses...</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6 animate-in">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Address Information</h1>
            <p className="text-sm text-slate-500 mt-1">Manage permanent, current, and correspondence addresses</p>
          </div>
        </div>
        {addresses.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total', value: addresses.length, gradient: 'from-emerald-500 to-teal-600', icon: MapPin },
              { label: 'Permanent', value: addresses.filter(a => a.addressType === 'permanent').length, gradient: 'from-blue-500 to-indigo-600', icon: Home },
              { label: 'Current', value: addresses.filter(a => a.addressType === 'current').length, gradient: 'from-violet-500 to-purple-600', icon: Navigation },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-4 text-white shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">{s.label}</p>
                  <s.icon className="w-4 h-4 opacity-70" />
                </div>
                <p className="text-3xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        )}
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
