'use client';

import { RoleSwitcher } from './role-switcher';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/use-role';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/profile-master': 'Profile Master',
  '/profile-master/basic-information': 'Basic Information',
  '/profile-master/address-information': 'Address Information',
  '/profile-master/identity-documents': 'Identity Documents',
  '/profile-master/qualifications': 'Qualifications',
  '/profile-master/employment-history': 'Employment History',
  '/profile-master/research-publications': 'Research & Publications',
  '/profile-master/certifications': 'Certifications',
  '/profile-master/medical-family': 'Medical & Family',
  '/profile-master/astrology-numerology': 'Astrology & Numerology',
  '/departments': 'Departments',
};

const roleLabels: Record<string, string> = {
  'super-admin': 'Super Admin', 'hr-admin': 'HR Admin',
  'employee': 'Employee', 'medical-staff': 'Medical Staff',
};

export function Header({ className }: { className?: string }) {
  const { role } = useRole();
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] ?? 'Employee Management';

  return (
    <header className={cn(
      'bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-none',
      className
    )}>
      {/* Left */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">{pageTitle}</h1>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          {roleLabels[role] || 'Employee'}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 pl-2">
          <span className="text-xs text-slate-400 hidden lg:block">Role</span>
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
}
