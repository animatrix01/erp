'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ResearchForm } from '@/components/custom/research-form';
import { Publication, ResearchProfile } from '@/lib/types';
import { Toast } from '@/components/ui/toast';
import { ArrowLeft, BookOpen, Star, Quote } from 'lucide-react';

export default function ResearchPublicationsPage() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id');
  const backHref = idFromUrl ? `/profile-master?id=${idFromUrl}` : '/profile-master';
  const [publications, setPublications] = useState<Publication[]>([]);
  const [researchProfile, setResearchProfile] = useState<ResearchProfile | undefined>();
  const [employeeId, setEmployeeId] = useState('');
  const [employeeDbId, setEmployeeDbId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const toast = (msg: string) => { setToastMessage(msg); setShowToast(true); };

  useEffect(() => {
    const load = async () => {
      try {
        // Get employee first so we have the ID for subsequent filtered fetches
        const empRes = await fetch('http://localhost/hrms-backend/employees.php');
        const employees = await empRes.json();

        if (Array.isArray(employees) && employees.length > 0) {
          const emp = employees[0];
          setEmployeeId(emp.employeeId ?? emp.id);
          setEmployeeDbId(emp.id);

          // Populate research profile fields from the employee record
          setResearchProfile({
            orcid:            emp.orcid            || '',
            scopusId:         emp.scopusId         || '',
            googleScholarUrl: emp.googleScholarUrl || '',
            researchgateUrl:  emp.researchgateUrl  || '',
            linkedinUrl:      emp.linkedinUrl      || '',
            personalWebsite:  emp.personalWebsite  || '',
          });

          // Now fetch publications filtered by this employee
          const pubRes = await fetch(`http://localhost/hrms-backend/publications.php?employeeId=${emp.id}`);
          const data = await pubRes.json();
          setPublications(
            Array.isArray(data)
              ? data.map((p: any) => ({
                  id:                p.id,
                  publicationType:   p.publicationType   || 'journal',
                  journalTitle:      p.journalTitle      || '',
                  authors:           p.authors           || '',
                  publisherVenue:    p.publisherVenue    || '',
                  conferenceDetails: p.conferenceDetails || '',
                  doi:               p.doi               || '',
                  impactFactor:      p.impactFactor      || 0,
                  publicationYear:   p.publicationYear   || new Date().getFullYear(),
                  volumeIssuePages:  p.volumeIssuePages  || '',
                  citationCount:     p.citationCount     || 0,
                }))
              : []
          );
        }
      } catch {
        // silent — toast shown on submit errors
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (data: Publication[], profile?: ResearchProfile) => {
    if (!employeeDbId) { toast('Save employee profile first'); return; }

    let pubsFailed = false;
    let profileFailed = false;

    // 1. Save publications batch
    const pubRes = await fetch('http://localhost/hrms-backend/publications_batch.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: employeeDbId, publications: data }),
    });
    if (pubRes.ok) {
      setPublications(data);
    } else {
      pubsFailed = true;
    }

    // 2. Save research profile IDs via PATCH on employees endpoint
    if (profile) {
      const profileRes = await fetch(
        `http://localhost/hrms-backend/employees.php?id=${employeeDbId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orcid:            profile.orcid            || null,
            scopusId:         profile.scopusId         || null,
            googleScholarUrl: profile.googleScholarUrl || null,
            researchgateUrl:  profile.researchgateUrl  || null,
            linkedinUrl:      profile.linkedinUrl      || null,
            personalWebsite:  profile.personalWebsite  || null,
          }),
        }
      );
      if (profileRes.ok) {
        setResearchProfile(profile);
      } else {
        profileFailed = true;
      }
    }

    if (pubsFailed && profileFailed) {
      toast('Failed to save publications and research profile');
    } else if (pubsFailed) {
      toast('Research profile saved, but publications failed');
    } else if (profileFailed) {
      toast('Publications saved, but research profile failed');
    } else {
      toast('Publications & research profile saved!');
    }
  };

  const totalCitations = publications.reduce((s, p) => s + Number(p.citationCount || 0), 0);
  const avgIF =
    publications.length > 0
      ? (
          publications.reduce((s, p) => s + Number(p.impactFactor || 0), 0) /
          publications.length
        ).toFixed(2)
      : '0';

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
            <h1 className="text-xl font-bold text-slate-900">Research & Publications</h1>
            <p className="text-xs text-slate-500">
              Journal articles, conference papers and academic contributions
            </p>
          </div>
        </div>

        {publications.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Publications', value: publications.length, icon: BookOpen },
              { label: 'Citations',    value: totalCitations,      icon: Quote   },
              { label: 'Avg IF',       value: avgIF,               icon: Star    },
            ].map((s) => (
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

        <ResearchForm
          defaultValues={publications}
          researchProfile={researchProfile}
          onSubmit={handleSubmit}
        />
      </div>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
