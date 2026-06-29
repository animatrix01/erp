'use client';

import { useEffect, useRef, useState } from 'react';
import { QualificationsTable } from '@/components/custom/qualifications-table';
import { Qualification } from '@/lib/types';
import { Toast } from '@/components/ui/toast';
import { GraduationCap, FlaskConical, Percent, Plus, TrendingUp, BookOpen } from 'lucide-react';

export default function QualificationsPage() {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const addRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost/hrms-backend/qualifications.php');
        const data = await res.json();
        setQualifications(Array.isArray(data) ? data.map((q: any) => ({
          id:              q.id,
          educationLevel:  q.educationLevel  || '',
          degreeName:      q.degreeName      || '',
          specialization:  q.specialization  || '',
          boardUniversity: q.boardUniversity || '',
          institution:     q.institution     || '',
          passingYear:     q.passingYear,
          scoreType:       q.scoreType       || 'percentage',
          scoreValue:      q.scoreValue      || '',
          percentage:      q.percentage      || 0,
          studyMode:       q.studyMode       || '',
          isPHD:           q.isPhd           || q.isPHD || false,
          thesisTitle:     q.thesisTitle     || '',
          researchGuide:   q.researchGuide   || '',
          researchArea:    q.researchArea    || '',
          vivaDate:        q.vivaDate        || '',
        })) : []);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (data: Qualification[]) => {
    try {
      const res = await fetch('http://localhost/hrms-backend/employees.php');
      const employees = await res.json();
      if (!Array.isArray(employees) || employees.length === 0) {
        setToastMessage('Please create an employee profile first'); setShowToast(true); return;
      }
      const r = await fetch('http://localhost/hrms-backend/qualifications_batch.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employees[0].id, qualifications: data }),
      });
      if (r.ok) { setQualifications(data); setToastMessage('Qualifications saved!'); }
      else { const e = await r.json(); setToastMessage(`Error: ${e.error || 'Failed to save'}`); }
      setShowToast(true);
    } catch { setToastMessage('Failed to save'); setShowToast(true); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading qualifications...</p>
      </div>
    </div>
  );

  const total = qualifications.length;
  const phdCount = qualifications.filter(q => q.isPHD).length;
  const avgPct = total > 0 ? (qualifications.reduce((s, q) => s + Number(q.percentage), 0) / total).toFixed(1) : '—';
  const highestYear = total > 0 ? Math.max(...qualifications.map(q => Number(q.passingYear))) : '—';

  // bar chart data — % per qualification
  const barData = qualifications.map(q => ({
    label: q.degreeName?.length > 10 ? q.degreeName.slice(0, 10) + '…' : q.degreeName || '?',
    value: Number(q.percentage),
  }));
  const maxBar = barData.length > 0 ? Math.max(...barData.map(b => b.value)) : 100;

  return (
    <>
      <div className="space-y-6 animate-in">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Educational Qualifications</h1>
            <p className="text-sm text-slate-500 mt-1">Manage degrees, diplomas, and academic credentials</p>
          </div>
          <button
            onClick={() => addRef.current?.()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-200 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add Qualification
          </button>
        </div>

        {/* Stats — always visible */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Degrees', value: total || '0', gradient: 'from-blue-500 to-indigo-600', icon: GraduationCap, sub: 'qualifications added' },
            { label: 'Ph.D. Degrees', value: phdCount || '0', gradient: 'from-violet-500 to-purple-600', icon: FlaskConical, sub: 'research degrees' },
            { label: 'Avg Percentage', value: avgPct === '—' ? '—' : `${avgPct}%`, gradient: 'from-emerald-500 to-teal-600', icon: Percent, sub: 'across all degrees' },
            { label: 'Latest Year', value: highestYear, gradient: 'from-amber-500 to-orange-600', icon: TrendingUp, sub: 'most recent degree' },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-4 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">{s.label}</p>
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <s.icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{s.value}</p>
              <p className="text-xs opacity-60">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Bar chart — always visible */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Performance Overview</h3>
              <p className="text-xs text-slate-400">Percentage scores per qualification</p>
            </div>
          </div>

          {barData.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-300">
              <GraduationCap className="w-10 h-10" />
              <p className="text-sm font-medium">Add qualifications to see the chart</p>
            </div>
          ) : (
            <div className="space-y-3">
              {barData.map((b, i) => {
                const gradients = ['from-blue-500 to-indigo-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500', 'from-cyan-500 to-blue-500'];
                const pct = Math.round((b.value / maxBar) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600 w-24 truncate flex-shrink-0">{b.label}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${gradients[i % gradients.length]} rounded-full transition-all duration-700 flex items-center justify-end pr-2`}
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">{b.value}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Distribution row */}
          {total > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
              {[
                { label: 'Distinction (≥75%)', value: qualifications.filter(q => Number(q.percentage) >= 75).length, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'First Class (≥60%)', value: qualifications.filter(q => Number(q.percentage) >= 60 && Number(q.percentage) < 75).length, color: 'text-blue-600 bg-blue-50' },
                { label: 'Pass (<60%)', value: qualifications.filter(q => Number(q.percentage) < 60).length, color: 'text-amber-600 bg-amber-50' },
              ].map(d => (
                <div key={d.label} className={`rounded-xl p-3 ${d.color}`}>
                  <p className="text-xl font-bold">{d.value}</p>
                  <p className="text-xs font-medium mt-0.5 opacity-80">{d.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <QualificationsTable defaultValues={qualifications} onSubmit={handleSubmit} onAddRef={addRef} />
      </div>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
