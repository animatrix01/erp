'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/hooks/use-role';
import { Eye, Loader2, Pencil as EditIcon, Plus, Search, ShieldOff, User, Users, X } from 'lucide-react';
import { Toast } from '@/components/ui/toast';

const BACKEND = 'http://localhost/hrms-backend';

interface EmployeeRow {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  email: string;
  photoUrl?: string;
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name }: { src?: string; name: string }) {
  const [broken, setBroken] = useState(false);
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  if (src && !broken) {
    const fullSrc = src.startsWith('http') ? src : `${BACKEND}/${src}`;
    return (
      <img src={fullSrc} alt={name} onError={() => setBroken(true)}
        className="w-28 h-28 rounded-xl object-cover border-2 border-slate-200 shadow-sm" />
    );
  }
  return (
    <div className="w-28 h-28 rounded-xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center">
      <span className="text-blue-600 font-bold text-3xl">{initials || <User className="w-10 h-10" />}</span>
    </div>
  );
}

// ── Add Employee Modal ────────────────────────────────────────────────────────
interface AddEmployeeModalProps {
  onClose: () => void;
  onSuccess: (emp: EmployeeRow) => void;
}

function AddEmployeeModal({ onClose, onSuccess }: AddEmployeeModalProps) {
  const [form, setForm] = useState({ firstName: '', lastName: '', employeeId: '', email: '', phone: '', designation: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, employeeId, email, phone, designation } = form;
    if (!firstName.trim() || !lastName.trim() || !employeeId.trim() || !email.trim() || !phone.trim()) {
      setError('All 5 fields are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND}/employees.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          employeeId: employeeId.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role: designation.trim(),       // maps Designation → role column
          designation: designation.trim(), // also fills designation column
          gender: 'male',
          bloodGroup: '',
          nationality: 'Indian',
          dateOfBirth: '2000-01-01',
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to create employee.'); return; }

      // Fetch the newly created employee's full row
      const listRes = await fetch(`${BACKEND}/employees.php`);
      const list: EmployeeRow[] = await listRes.json();
      const newest = list[list.length - 1];
      onSuccess(newest);
    } catch {
      setError('Cannot reach the server. Please ensure XAMPP (Apache + MySQL) is running and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add New Employee</h2>
            <p className="text-xs text-slate-400 mt-0.5">Fill in the quick details to create a record</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* First Name */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                First Name *
              </label>
              <input ref={firstRef} value={form.firstName} onChange={(e) => set('firstName', e.target.value)}
                placeholder="John"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            {/* Last Name */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Last Name *
              </label>
              <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)}
                placeholder="Doe"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          {/* Employee ID */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Employee ID *
            </label>
            <input value={form.employeeId} onChange={(e) => set('employeeId', e.target.value)}
              placeholder="EMP1001"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Email *
            </label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
              placeholder="john.doe@college.edu"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>

          {/* Mobile */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Mobile Number *
            </label>
            <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
              placeholder="+919876543210"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>

          {/* Designation */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Designation
            </label>
            <input value={form.designation} onChange={(e) => set('designation', e.target.value)}
              placeholder="Assistant Professor, Lecturer…"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Plus className="w-4 h-4" /> Create & Send Invite</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EmployeeProfilesPage() {
  const { hasAccess } = useRole();
  const isAllowed = hasAccess(['super-admin', 'hr-admin']);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  const fetchEmployees = () =>
    fetch(`${BACKEND}/employees.php`)
      .then((r) => r.json())
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch(console.error);

  useEffect(() => {
    if (!isAllowed) { setLoading(false); return; }
    fetchEmployees().finally(() => setLoading(false));
  }, [isAllowed]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      e.firstName?.toLowerCase().includes(q) || e.lastName?.toLowerCase().includes(q) ||
      e.employeeId?.toLowerCase().includes(q) || e.designation?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q)
    );
  }, [employees, searchTerm]);

  const handleCreated = (emp: EmployeeRow) => {
    setEmployees((prev) => [...prev, emp]);
    setShowModal(false);
    setToast(`${emp.firstName} ${emp.lastName} created successfully!`);
  };

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <ShieldOff className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Access Denied</h2>
        <p className="text-sm text-slate-500 text-center max-w-xs">
          Employee Profiles are restricted to HR Admins and Super Admins.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Employee Profiles</h1>
              <p className="text-xs text-slate-500">{employees.length} employees · {filtered.length} shown</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add New Employee
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID, designation, department…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm" />
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users className="w-10 h-10 text-slate-300" />
            <p className="text-sm text-slate-500">
              {searchTerm ? `No employees match "${searchTerm}"` : 'No employees found'}
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((emp) => {
            const fullName = [emp.firstName, emp.lastName].filter(Boolean).join(' ');
            return (
              <div key={emp.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col">
                <div className="h-0.5 bg-blue-600" />

                {/* Photo */}
                <div className="flex justify-center pt-6 pb-3 px-4">
                  <Avatar src={emp.photoUrl} name={fullName || emp.employeeId} />
                </div>

                {/* Info */}
                <div className="px-4 pb-4 flex-1 space-y-2.5">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 truncate" title={fullName}>
                      {fullName || '—'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{emp.employeeId}</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg px-3 py-2.5 space-y-1.5">
                    {emp.designation && (
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide w-16 flex-shrink-0 pt-px">Designation</span>
                        <span className="text-xs font-bold text-slate-800 leading-tight">{emp.designation}</span>
                      </div>
                    )}
                    {emp.department && (
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide w-16 flex-shrink-0 pt-px">Dept</span>
                        <span className="text-xs font-bold text-slate-800 leading-tight">{emp.department}</span>
                      </div>
                    )}
                    {!emp.designation && !emp.department && (
                      <p className="text-xs text-slate-400 text-center truncate">{emp.email}</p>
                    )}
                  </div>
                </div>

                {/* Actions — both go to specific employee UUID routes */}
                <div className="border-t border-slate-100 grid grid-cols-2 divide-x divide-slate-100">
                  <Link href={`/employee-profiles/${emp.id}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                  <Link href={`/profile-master?id=${emp.id}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                    <EditIcon className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <AddEmployeeModal
          onClose={() => setShowModal(false)}
          onSuccess={handleCreated}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  );
}
