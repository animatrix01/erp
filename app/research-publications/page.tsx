'use client';

import { useEffect, useState } from 'react';
import { ResearchForm } from '@/components/custom/research-form';
import { Publication, ResearchProfile } from '@/lib/types';
import { Toast } from '@/components/ui/toast';
import { BookOpen, Star, Quote } from 'lucide-react';

export default function ResearchPublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost/hrms-backend/publications.php');
        const data = await res.json();
        setPublications(Array.isArray(data) ? data.map((p: any) => ({
          id:                p.id,
          publicationType:   p.publicationType  || 'journal',
          journalTitle:      p.journalTitle     || '',
          authors:           p.authors          || '',
          publisherVenue:    p.publisherVenue   || '',
          conferenceDetails: p.conferenceDetails|| '',
          doi:               p.doi              || '',
          impactFactor:      p.impactFactor     || 0,
          publicationYear:   p.publicationYear  || new Date().getFullYear(),
          volumeIssuePages:  p.volumeIssuePages || '',
          citationCount:     p.citationCount    || 0,
        })) : []);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (data: Publication[], _profile?: ResearchProfile) => {
    try {
      const res = await fetch('http://localhost/hrms-backend/employees.php');
      const employees = await res.json();
      if (!Array.isArray(employees) || employees.length === 0) { setToastMessage('Please create an employee profile first'); setShowToast(true); return; }
      const r = await fetch('http://localhost/hrms-backend/publications_batch.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: employees[0].id, publications: data }) });
      if (r.ok) { setPublications(data); setToastMessage('Publications saved!'); }
      else { const e = await r.json(); setToastMessage(`Error: ${e.error || 'Failed to save'}`); }
      setShowToast(true);
    } catch { setToastMessage('Failed to save'); setShowToast(true); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading publications...</p>
      </div>
    </div>
  );

  const totalCitations = publications.reduce((s, p) => s + Number(p.citationCount || 0), 0);
  const avgIF = publications.length > 0 ? (publications.reduce((s, p) => s + Number(p.impactFactor || 0), 0) / publications.length).toFixed(2) : '0';

  return (
    <>
      <div className="space-y-6 animate-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Research & Publications</h1>
          <p className="text-sm text-slate-500 mt-1">Manage journal articles, conference papers, and academic contributions</p>
        </div>
        {publications.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Publications', value: publications.length, gradient: 'from-cyan-500 to-blue-600', icon: BookOpen },
              { label: 'Total Citations', value: totalCitations, gradient: 'from-violet-500 to-purple-600', icon: Quote },
              { label: 'Avg IF', value: avgIF, gradient: 'from-amber-500 to-orange-600', icon: Star },
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
        <ResearchForm defaultValues={publications} onSubmit={handleSubmit} />
      </div>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
