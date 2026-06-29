'use client';

import { useEffect, useState } from 'react';
import { EmploymentTable } from '@/components/custom/employment-table';
import { EmploymentRecord } from '@/lib/types';
import { Toast } from '@/components/ui/toast';
import { Briefcase, Clock, Building } from 'lucide-react';

export default function EmploymentHistoryPage() {
  const [history, setHistory] = useState<EmploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost/hrms-backend/employment_history.php');
        const data = await res.json();
        setHistory(Array.isArray(data) ? data.map((e: any) => ({
          id:                   e.id,
          organizationName:     e.organizationName     || '',
          designation:          e.designation          || '',
          department:           e.department           || '',
          employmentType:       e.employmentType       || 'Full-Time',
          fromDate:             e.fromDate,
          toDate:               e.toDate               || null,
          isCurrent:            e.isCurrent            || false,
          totalExperienceYears: e.totalExperienceYears || 0,
        })) : []);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (data: EmploymentRecord[]) => {
    try {
      const res = await fetch('http://localhost/hrms-backend/employees.php');
      const employees = await res.json();
      if (!Array.isArray(employees) || employees.length === 0) { setToastMessage('Please create an employee profile first'); setShowToast(true); return; }
      const r = await fetch('http://localhost/hrms-backend/employment_history_batch.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: employees[0].id, employmentHistory: data }) });
      if (r.ok) { setHistory(data); setToastMessage('Employment history saved!'); }
      else { const e = await r.json(); setToastMessage(`Error: ${e.error || 'Failed to save'}`); }
      setShowToast(true);
    } catch { setToastMessage('Failed to save'); setShowToast(true); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading employment history...</p>
      </div>
    </div>
  );

  const totalYears = history.reduce((s, r) => s + Number(r.totalExperienceYears || 0), 0).toFixed(1);

  return (
    <>
      <div className="space-y-6 animate-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employment History</h1>
          <p className="text-sm text-slate-500 mt-1">Track previous employment records and work experience</p>
        </div>
        {history.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Records', value: history.length, gradient: 'from-indigo-500 to-blue-600', icon: Briefcase },
              { label: 'Total Exp.', value: `${totalYears}y`, gradient: 'from-emerald-500 to-teal-600', icon: Clock },
              { label: 'Orgs', value: new Set(history.map(h => h.organizationName)).size, gradient: 'from-orange-500 to-amber-600', icon: Building },
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
        <EmploymentTable defaultValues={history} onSubmit={handleSubmit} />
      </div>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
