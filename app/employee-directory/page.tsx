'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/hooks/use-role';
import { Eye, Pencil, Search, ShieldOff, User, Users } from 'lucide-react';

const BACKEND = 'http://localhost/hrms-backend';

interface EmployeeRow {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role?: string;
  designation?: string;
  department?: string;
  email: string;
  photoUrl?: string;
}

function Avatar({ src, name }: { src?: string; name: string }) {
  const [broken, setBroken] = useState(false);
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (src && !broken) {
    const fullSrc = src.startsWith('http') ? src : `${BACKEND}/${src}`;
    return (
      <img
        src={fullSrc}
        alt={name}
        onError={() => setBroken(true)}
        className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-sm"
      />
    );
  }
  return (
    <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center flex-shrink-0">
      <span className="text-blue-600 font-bold text-xl">{initials || <User className="w-8 h-8" />}</span>
    </div>
  );
}

export default function EmployeeDirectoryPage() {
  const { hasAccess } = useRole();
  const isAllowed = hasAccess(['super-admin', 'hr-admin']);

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!isAllowed) { setLoading(false); return; }
    fetch(`${BACKEND}/employees.php`)
      .then((r) => r.json())
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAllowed]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.firstName?.toLowerCase().includes(q) ||
        e.lastName?.toLowerCase().includes(q) ||
        e.displayName?.toLowerCase().includes(q) ||
        e.employeeId?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q)
    );
  }, [employees, searchTerm]);

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <ShieldOff className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Access Denied</h2>
        <p className="text-sm text-slate-500 text-center max-w-xs">
          The Employee Directory is restricted to HR Admins and Super Admins.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-5 animate-in">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-52 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Employee Directory</h1>
            <p className="text-xs text-slate-500">{employees.length} employees · {filtered.length} shown</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, ID, designation, department…"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Users className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-500">
            {searchTerm ? `No employees match "${searchTerm}"` : 'No employees found'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {filtered.map((emp) => {
          const fullName = [emp.firstName, emp.lastName].filter(Boolean).join(' ');
          const subtitle = emp.designation || emp.role || emp.department || emp.email;

          return (
            <div
              key={emp.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col"
            >
              <div className="h-0.5 bg-blue-600" />
              <div className="flex flex-col items-center px-4 pt-5 pb-4 flex-1">
                <Avatar src={emp.photoUrl} name={fullName || emp.employeeId} />
                <div className="mt-3 text-center min-w-0 w-full">
                  <p className="text-sm font-bold text-slate-900 truncate" title={fullName}>
                    {fullName || '—'}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5" title={subtitle}>
                    {subtitle || emp.employeeId}
                  </p>
                  {emp.department && emp.designation && (
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{emp.department}</p>
                  )}
                </div>
              </div>
              <div className="flex border-t border-slate-100">
                <Link
                  href={`/profile-master/basic-information`}
                  title="View Profile"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Link>
                <div className="w-px bg-slate-100" />
                <Link
                  href={`/profile-master/basic-information`}
                  title="Edit Profile"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
