'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { QualificationsForm } from '@/components/custom/qualifications-form';
import { Qualification, QualificationLevel } from '@/lib/types';
import { Toast } from '@/components/ui/toast';
import { ArrowLeft, GraduationCap, BookOpen, Award } from 'lucide-react';

const BACKEND = 'http://localhost/hrms-backend';

// Valid tiers the form uses
const VALID_LEVELS = ['10th', '12th', 'UG', 'PG', 'PhD'] as const;

function mapQual(q: any): Qualification {
  // Use educationLevel from DB — fall back to isPhd flag for legacy rows
  const level = (VALID_LEVELS as readonly string[]).includes(q.educationLevel)
    ? q.educationLevel as QualificationLevel
    : q.isPhd ? 'PhD' as QualificationLevel : 'UG' as QualificationLevel;

  return {
    id:              q.id,
    level,                              // ← correct tier from DB
    degreeName:      q.degreeName      || '',
    educationLevel:  level,
    specialization:  q.specialization  || '',
    boardUniversity: q.boardUniversity || '',
    institution:     q.institution     || '',
    passingYear:     Number(q.passingYear) || 0,
    scoreType:       q.scoreType       || 'percentage',
    scoreValue:      q.scoreValue      || '',
    percentage:      Number(q.percentage)  || 0,
    studyMode:       q.studyMode       || '',
    isPHD:           Boolean(q.isPhd),
    thesisTitle:     q.thesisTitle     || '',
    researchGuide:   q.researchGuide   || '',
    researchArea:    q.researchArea    || '',
    vivaDate:        q.vivaDate        || '',
    documentUrl:     q.documentUrl     || '',
  };
}

export default function QualificationsPage() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id');
  const backHref = idFromUrl ? `/profile-master?id=${idFromUrl}` : '/profile-master';

  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [formKey, setFormKey]               = useState(0);
  const [employeeId, setEmployeeId]         = useState('');
  const [loading, setLoading]               = useState(true);
  const [showToast, setShowToast]           = useState(false);
  const [toastMessage, setToastMessage]     = useState('');

  const toast = (msg: string) => { setToastMessage(msg); setShowToast(true); };

  useEffect(() => {
    const load = async () => {
      try {
        let empId = idFromUrl;
        if (!empId) {
          const res = await fetch(`${BACKEND}/employees.php`);
          const employees = await res.json();
          if (!Array.isArray(employees) || employees.length === 0) { setLoading(false); return; }
          empId = employees[0].id;
        }
        setEmployeeId(empId!);
        const qRes = await fetch(`${BACKEND}/qualifications.php?employeeId=${empId}`);
        const data = await qRes.json();
        setQualifications(Array.isArray(data) ? data.map(mapQual) : []);
      } catch (err) {
        console.error('Failed to load qualifications:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idFromUrl]);

  const handleSubmit = async (formData: FormData) => {
    if (!employeeId) { toast('Save employee profile first'); return; }
    formData.append('employeeId', employeeId);

    console.log('[1] Sending to qualifications_batch.php, employeeId:', employeeId);

    try {
      const res = await fetch(`${BACKEND}/qualifications_batch.php`, {
        method: 'POST',
        body: formData,
      });

      console.log('[2] Server response status:', res.status);

      if (res.ok) {
        toast('Qualifications saved successfully');
        const qRes = await fetch(`${BACKEND}/qualifications.php?employeeId=${employeeId}`);
        const data = await qRes.json();
        const mapped = Array.isArray(data) ? data.map(mapQual) : [];
        console.log('[3] Re-fetched qualifications from DB:', mapped);
        setQualifications(mapped);
        // DO NOT bump formKey — that destroys + remounts the form causing the blank flash.
        // The useEffect inside QualificationsForm will call form.reset() when defaultValues changes.
      } else {
        const err = await res.json();
        console.error('Save error:', err);
        toast('Failed to save qualifications');
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast('An error occurred while saving');
    }
  };

  const filled   = qualifications.filter(q => q.institution).length;
  const hasPhd   = qualifications.some(q => q.isPHD && q.institution);
  const withDocs = qualifications.filter(q => q.documentUrl).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
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
            <h1 className="text-xl font-bold text-slate-900">Qualifications</h1>
            <p className="text-xs text-slate-500">10th · 12th · Under-Graduation · Post-Graduation · Ph.D.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Tiers Filled', value: `${filled} / 5`,      icon: GraduationCap },
            { label: 'Ph.D.',        value: hasPhd ? 'Yes' : 'No', icon: Award        },
            { label: 'Documents',    value: `${withDocs} files`,   icon: BookOpen     },
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

        <QualificationsForm key={formKey} defaultValues={qualifications} onSubmit={handleSubmit} />
      </div>

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
