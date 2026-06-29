'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AstrologyNumerologyForm } from '@/components/custom/astrology-numerology-form';
import { AstrologyProfile, NumerologyProfile } from '@/lib/types';
import { AstrologyProfileFormData, NumerologyProfileFormData } from '@/lib/validations/astrology-numerology';
import { Toast } from '@/components/ui/toast';

const API_BASE = 'http://localhost/hrms-backend';

export default function AstrologyNumerologyPage() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id');
  const backHref = idFromUrl ? `/profile-master?id=${idFromUrl}` : '/profile-master';
  const [astrologyData, setAstrologyData]   = useState<AstrologyProfile | undefined>();
  const [numerologyData, setNumerologyData] = useState<NumerologyProfile | undefined>();
  const [employeeId, setEmployeeId]         = useState('');
  const [loading, setLoading]               = useState(true);
  const [showToast, setShowToast]           = useState(false);
  const [toastMessage, setToastMessage]     = useState('');

  const toast = (msg: string) => { setToastMessage(msg); setShowToast(true); };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const empRes   = await fetch(`${API_BASE}/employees.php`);
      const employees = await empRes.json();
      if (!Array.isArray(employees) || employees.length === 0) { setLoading(false); return; }

      const emp = employees[0];
      setEmployeeId(emp.id);

      const [astroRes, numRes] = await Promise.all([
        fetch(`${API_BASE}/astrology_profiles.php?employeeId=${emp.id}`),
        fetch(`${API_BASE}/numerology_profiles.php?employeeId=${emp.id}`),
      ]);

      if (astroRes.ok) {
        const astroJson = await astroRes.json();
        setAstrologyData(astroJson || undefined);
      }
      if (numRes.ok) {
        const numJson = await numRes.json();
        setNumerologyData(numJson || undefined);
      }
    } catch (error) {
      console.error('Failed to fetch astrology/numerology data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    astrology: AstrologyProfileFormData,
    numerology: NumerologyProfileFormData
  ) => {
    if (!employeeId) { toast('Save employee profile first'); return; }

    try {
      const [astroRes, numRes] = await Promise.all([
        fetch(`${API_BASE}/astrology_profiles.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId, ...astrology }),
        }),
        fetch(`${API_BASE}/numerology_profiles.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId, ...numerology }),
        }),
      ]);

      if (astroRes.ok && numRes.ok) {
        toast('Astrology & Numerology profiles saved!');
        fetchData();
      } else {
        const astroErr = astroRes.ok ? null : await astroRes.json();
        const numErr   = numRes.ok  ? null : await numRes.json();
        console.error('Save errors:', { astroErr, numErr });
        toast('Failed to save one or more profiles. Check console.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast('An error occurred while saving. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading astrology & numerology data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in">
        {/* Back nav — consistent with all other profile-master pages */}
        <div className="flex items-center gap-3">
          <Link href={backHref} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Astrology & Numerology</h1>
            <p className="text-xs text-slate-500">
              Vedic, Western, Chinese astrology and numerological profile
            </p>
          </div>
        </div>

        <AstrologyNumerologyForm
          astrologyData={astrologyData}
          numerologyData={numerologyData}
          onSubmit={handleSubmit}
        />
      </div>

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
