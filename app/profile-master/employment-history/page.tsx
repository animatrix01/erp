'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EmploymentTable } from '@/components/custom/employment-table';
import { EmploymentRecord } from '@/lib/types';
import { Toast } from '@/components/ui/toast';
import { ArrowLeft, Briefcase, Clock, Building } from 'lucide-react';

export default function EmploymentHistoryPage() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id');
  const backHref = idFromUrl ? `/profile-master?id=${idFromUrl}` : '/profile-master';
  const [history, setHistory] = useState<EmploymentRecord[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost/hrms-backend/employees.php');
        const employees = await res.json();
        if (Array.isArray(employees) && employees.length > 0) {
          const empId = employees[0].id;
          setEmployeeId(empId);
          const eRes = await fetch(`http://localhost/hrms-backend/employment_history.php?employeeId=${empId}`);
          const data = await eRes.json();
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
        }
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (data: EmploymentRecord[]) => {
    if (!employeeId) { setToastMessage('Save profile first'); setShowToast(true); return; }
    const res = await fetch('http://localhost/hrms-backend/employment_history_batch.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId, employmentHistory: data }) });
    if (res.ok) { setHistory(data); setToastMessage('Employment history saved!'); } else setToastMessage('Failed to save');
    setShowToast(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" /></div>;

  const totalYears = history.reduce((s, r) => s + Number(r.totalExperienceYears || 0), 0).toFixed(1);

  return (
    <>
      <div className="space-y-5 animate-in">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Employment History</h1>
            <p className="text-xs text-slate-500">Previous work experience and service records</p>
          </div>
        </div>

        {history.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Records',     value: history.length,                                      icon: Briefcase },
              { label: 'Total Exp.',  value: `${totalYears}y`,                                    icon: Clock },
              { label: 'Orgs',        value: new Set(history.map(h => h.organizationName)).size,  icon: Building },
            ].map(s => (
              <div key={s.label} className="stat-card flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
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
