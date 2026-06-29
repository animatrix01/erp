'use client';

import { useEffect, useState } from 'react';
import { useRole } from '@/hooks/use-role';
import { User, Building2, GraduationCap, Award, CheckCircle2, ArrowRight, Briefcase, BookOpen, Heart, CreditCard, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  { key: 'basic',          label: 'Basic Information',       icon: User,          href: '/profile-master/basic-information' },
  { key: 'identity',       label: 'Identity Documents',      icon: CreditCard,    href: '/profile-master/identity-documents' },
  { key: 'qualifications', label: 'Qualifications',          icon: GraduationCap, href: '/profile-master/qualifications' },
  { key: 'employment',     label: 'Employment History',      icon: Briefcase,     href: '/profile-master/employment-history' },
  { key: 'research',       label: 'Research & Publications', icon: BookOpen,      href: '/profile-master/research-publications' },
  { key: 'certifications', label: 'Certifications',          icon: Award,         href: '/profile-master/certifications' },
  { key: 'medical',        label: 'Medical & Family',        icon: Heart,         href: '/profile-master/medical-family' },
  { key: 'astrology',      label: 'Astrology & Numerology',  icon: Sparkles,      href: '/profile-master/astrology-numerology' },
];

export default function DashboardPage() {
  const { role } = useRole();
  const [departments, setDepartments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost/hrms-backend/departments.php')
      .then(r => r.json())
      .then(data => setDepartments(Array.isArray(data) ? data.filter((d: any) => d.isActive).length : 0))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roleLabel: Record<string, string> = {
    'super-admin': 'Super Admin', 'hr-admin': 'HR Admin',
    employee: 'Employee', 'medical-staff': 'Medical Staff',
  };

  return (
    <div className="space-y-5 animate-in">

      {/* Hero */}
      <div className="bg-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">Welcome back</p>
            <h1 className="text-xl font-bold text-white mb-1">Employee Profile Management</h1>
            <p className="text-slate-400 text-sm">Institutional ERP · Human Resources Module</p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-semibold border border-white/10">
              {roleLabel[role] || 'Employee'}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              System Online
            </div>
          </div>
        </div>
      </div>

      {/* Stats — profile/qualifications/certifications are intentionally blank (HR view) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Profile',        value: '—', sub: 'registered',        icon: User          },
          { label: 'Departments',    value: loading ? '—' : departments,   sub: 'active',            icon: Building2     },
          { label: 'Qualifications', value: '—', sub: 'on record',         icon: GraduationCap },
          { label: 'Certifications', value: '—', sub: 'professional certs',icon: Award         },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <s.icon className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-0.5">{s.value}</p>
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Profile Completion Tracker — empty state for HR */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Profile Completion</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select an employee from the directory to view their completion status</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900">0<span className="text-slate-400 text-base">/{STEPS.length}</span></p>
              <p className="text-xs text-slate-400">completed</p>
            </div>
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="19" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle cx="24" cy="24" r="19" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 19}`}
                  strokeDashoffset={`${2 * Math.PI * 19}`}
                  className="transition-all duration-700" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">0%</span>
            </div>
          </div>
        </div>

        {/* Progress segments — all empty */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex gap-1">
            {STEPS.map(s => (
              <div key={s.key} className="flex-1 h-1.5 rounded-full bg-slate-200" />
            ))}
          </div>
        </div>

        {/* Steps — all shown as pending */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Link key={step.key} href={step.href}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer group">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-slate-100 text-slate-500">
                    {i + 1}
                  </div>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-50">
                    <Icon className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{step.label}</p>
                    <p className="text-xs text-slate-400">Select an employee first</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Profile Master', href: '/profile-master', icon: User,      desc: 'Manage all employee information' },
          { label: 'Departments',    href: '/departments',    icon: Building2, desc: 'Org structure & department hierarchy' },
        ].map(mod => (
          <Link key={mod.href} href={mod.href}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                <mod.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-sm">{mod.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{mod.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
