'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  User, CreditCard, GraduationCap, Briefcase,
  BookOpen, Award, Heart, ArrowRight, CheckCircle2, Sparkles,
} from 'lucide-react';

const buildSections = (id: string | null) => {
  const q = id ? `?id=${id}` : '';
  return [
    { id: 'basic-information',     label: 'Basic Information',       icon: User,          desc: 'Personal details, contact info, photo & addresses',    href: `/profile-master/basic-information${q}`      },
    { id: 'identity-documents',    label: 'Identity Documents',      icon: CreditCard,    desc: 'Aadhar, PAN, Passport, Driving License & uploads',     href: `/profile-master/identity-documents${q}`     },
    { id: 'qualifications',        label: 'Qualifications',          icon: GraduationCap, desc: 'Degrees, diplomas and academic credentials',           href: `/profile-master/qualifications${q}`         },
    { id: 'employment-history',    label: 'Employment History',      icon: Briefcase,     desc: 'Previous work experience and service records',         href: `/profile-master/employment-history${q}`     },
    { id: 'research-publications', label: 'Research & Publications', icon: BookOpen,      desc: 'Journal articles, conference papers and research',     href: `/profile-master/research-publications${q}`  },
    { id: 'certifications',        label: 'Certifications',          icon: Award,         desc: 'Professional certifications and credentials',          href: `/profile-master/certifications${q}`         },
    { id: 'medical-family',        label: 'Medical & Family',        icon: Heart,         desc: 'Health records, emergency contacts and dependents',    href: `/profile-master/medical-family${q}`         },
    { id: 'astrology-numerology',  label: 'Astrology & Numerology',  icon: Sparkles,      desc: 'Vedic, Western, Chinese astrology and numerology',     href: `/profile-master/astrology-numerology${q}`   },
  ];
};

interface Stats {
  hasProfile: boolean;
  profileName: string;
  hasIdentity: boolean;
  qualifications: number;
  employment: number;
  publications: number;
  certifications: number;
  hasMedical: boolean;
  hasAstrology: boolean;
}

export default function ProfileMasterPage() {
  const searchParams = useSearchParams();
  const employeeIdFromUrl = searchParams.get('id'); // UUID from ?id=

  const sections = buildSections(employeeIdFromUrl);

  const [stats, setStats] = useState<Stats>({
    hasProfile: false, profileName: '', hasIdentity: false,
    qualifications: 0, employment: 0, publications: 0, certifications: 0, hasMedical: false, hasAstrology: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // No id in URL = Create Mode, show blank dashboard
        if (!employeeIdFromUrl) {
          setLoading(false);
          return;
        }

        // Edit Mode — load specific employee by UUID
        const res = await fetch(`http://localhost/hrms-backend/employees.php?id=${employeeIdFromUrl}`);
        const emp = await res.json();

        if (!emp?.id) { setLoading(false); return; }

        const [iRes, qRes, eRes, pRes, cRes, mRes, aRes] = await Promise.all([
          fetch(`http://localhost/hrms-backend/identity_documents.php?employeeId=${emp.id}`),
          fetch(`http://localhost/hrms-backend/qualifications.php?employeeId=${emp.id}`),
          fetch(`http://localhost/hrms-backend/employment_history.php?employeeId=${emp.id}`),
          fetch(`http://localhost/hrms-backend/publications.php?employeeId=${emp.id}`),
          fetch(`http://localhost/hrms-backend/certifications.php?employeeId=${emp.id}`),
          fetch(`http://localhost/hrms-backend/medical.php?employeeId=${emp.id}`),
          fetch(`http://localhost/hrms-backend/astrology_profiles.php?employeeId=${emp.id}`),
        ]);
        const [iData, qData, eData, pData, cData, mData, aData] = await Promise.all([
          iRes.json(), qRes.json(), eRes.json(), pRes.json(), cRes.json(), mRes.json(), aRes.json(),
        ]);
        setStats({
          hasProfile: true,
          profileName: `${emp.firstName} ${emp.lastName}`,
          hasIdentity: !!(iData?.aadharNumber || iData?.panNumber || iData?.passportNumber),
          qualifications: Array.isArray(qData) ? qData.length : 0,
          employment: Array.isArray(eData) ? eData.length : 0,
          publications: Array.isArray(pData) ? pData.length : 0,
          certifications: Array.isArray(cData) ? cData.length : 0,
          hasMedical: Array.isArray(mData) && mData.length > 0 && !!mData[0]?.bloodGroup,
          hasAstrology: !!(aData?.zodiacSign || aData?.nakshatra || aData?.chineseZodiac),
        });
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [employeeIdFromUrl]);

  const getBadge = (id: string): { label: string; done: boolean } => {
    const map: Record<string, { label: string; done: boolean }> = {
      'basic-information':     { label: stats.hasProfile ? 'Completed' : 'Pending',     done: stats.hasProfile },
      'identity-documents':    { label: stats.hasIdentity ? 'Completed' : 'Pending',    done: stats.hasIdentity },
      'qualifications':        { label: stats.qualifications > 0 ? `${stats.qualifications} records` : 'Pending', done: stats.qualifications > 0 },
      'employment-history':    { label: stats.employment > 0 ? `${stats.employment} records` : 'Pending',        done: stats.employment > 0 },
      'research-publications': { label: stats.publications > 0 ? `${stats.publications} records` : 'Pending',    done: stats.publications > 0 },
      'certifications':        { label: stats.certifications > 0 ? `${stats.certifications} records` : 'Pending', done: stats.certifications > 0 },
      'medical-family':        { label: stats.hasMedical ? 'Completed' : 'Pending',     done: stats.hasMedical },
      'astrology-numerology':  { label: stats.hasAstrology ? 'Completed' : 'Pending',   done: stats.hasAstrology },
    };
    return map[id] ?? { label: 'Pending', done: false };
  };

  const completedCount = sections.filter(s => getBadge(s.id).done).length;
  const pct = Math.round((completedCount / sections.length) * 100);

  return (
    <div className="space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile Master</h1>
          <p className="text-sm text-slate-500 mt-1">
            {employeeIdFromUrl ? 'Editing employee profile' : 'Create a new employee profile'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {employeeIdFromUrl && (
            <Link href="/employee-profiles"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors">
              ← Back to Directory
            </Link>
          )}
          <span className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${stats.hasProfile ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            {stats.hasProfile ? stats.profileName : 'New Employee'}
          </span>
        </div>
      </div>

      {employeeIdFromUrl ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Profile Completion</span>
            <span className="text-xs font-semibold text-slate-600">{completedCount} / {sections.length} sections · {pct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex gap-1 mt-2">
            {sections.map(s => (
              <div key={s.id} className={`flex-1 h-1 rounded-full transition-all duration-500 ${getBadge(s.id).done ? 'bg-blue-600' : 'bg-slate-100'}`} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Creating New Employee</p>
            <p className="text-xs text-blue-600 mt-0.5">Start with Basic Information below. Progress will appear once an employee is saved.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const badge = getBadge(sec.id);
            return (
              <Link key={sec.id} href={sec.href} className="block group">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
                  <div className={`h-0.5 ${badge.done ? 'bg-blue-600' : 'bg-slate-200'}`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${badge.done ? 'bg-blue-600' : 'bg-slate-100'}`}>
                        <Icon className={`w-4 h-4 ${badge.done ? 'text-white' : 'text-slate-500'}`} />
                      </div>
                      {badge.done
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        : <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      }
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-0.5">{sec.label}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{sec.desc}</p>
                    <span className={badge.done ? 'badge-done' : 'badge-pending'}>
                      <div className={`w-1.5 h-1.5 rounded-full ${badge.done ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {badge.label}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
