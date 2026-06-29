'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { RestrictionBanner } from '@/components/custom/restriction-banner';
import { useRole } from '@/hooks/use-role';
import { Plus, Edit, Trash2, Building2, User, X, CheckCircle2, XCircle, Hash, PieChart } from 'lucide-react';

interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
  description?: string;
  parentDepartmentId?: string;
  headOfDepartment?: string;
  isActive: boolean;
}

const SLICE_COLORS = [
  '#2563eb', '#475569', '#64748b', '#94a3b8',
  '#1d4ed8', '#334155', '#1e40af', '#0f172a',
  '#3b82f6', '#1e293b',
];

interface PieData { label: string; value: number; color: string }

function PieChartSVG({ data }: { data: PieData[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return (
    <div className="flex items-center justify-center h-full text-slate-300 flex-col gap-2">
      <PieChart className="w-12 h-12" />
      <p className="text-sm">No data yet</p>
    </div>
  );

  const cx = 120, cy = 120, r = 100, ir = 45;
  let cumAngle = -Math.PI / 2;

  const slices = data.map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    cumAngle += angle;
    const midAngle = startAngle + angle / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle);
    const y2 = cy + r * Math.sin(startAngle + angle);
    const ix1 = cx + ir * Math.cos(startAngle);
    const iy1 = cy + ir * Math.sin(startAngle);
    const ix2 = cx + ir * Math.cos(startAngle + angle);
    const iy2 = cy + ir * Math.sin(startAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const labelR = (r + ir) / 2;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    const pct = Math.round((d.value / total) * 100);
    return { ...d, path: `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`, lx, ly, pct, angle };
  });

  return (
    <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-lg">
      {slices.map((s, i) => (
        <g key={i}>
          <path d={s.path} fill={s.color} stroke="white" strokeWidth="2"
            className="transition-all duration-200 hover:opacity-80 cursor-pointer" />
          {s.angle > 0.25 && (
            <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize="9" fontWeight="700">{s.pct}%</text>
          )}
        </g>
      ))}
      <circle cx={cx} cy={cy} r={ir - 3} fill="white" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#334155" fontSize="18" fontWeight="800">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="8">DEPTS</text>
    </svg>
  );
}

// PHP backend URL
const DEPARTMENTS_API = 'http://localhost/hrms-backend/departments.php';

// Normalize PHP snake_case keys -> camelCase to match the Department interface
function normalizeDept(d: any): Department {
  return {
    id:                 d.id,
    departmentCode:     d.department_code      ?? d.departmentCode,
    departmentName:     d.department_name      ?? d.departmentName,
    description:        d.description          ?? undefined,
    parentDepartmentId: d.parent_department_id ?? d.parentDepartmentId ?? undefined,
    headOfDepartment:   d.head_of_department   ?? d.headOfDepartment  ?? undefined,
    isActive:           Boolean(d.is_active    ?? d.isActive),
  };
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [empCounts, setEmpCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const { hasAccess } = useRole();
  const isRestricted = !hasAccess(['super-admin', 'hr-admin']);

  const [formData, setFormData] = useState({
    departmentCode: '', departmentName: '', description: '',
    parentDepartmentId: '', headOfDepartment: '', isActive: true,
  });

  useEffect(() => { loadDepartments(); }, []);

  const loadDepartments = async () => {
    try {
      const [deptRes, assignRes] = await Promise.all([
        fetch(DEPARTMENTS_API),
        fetch('http://localhost/hrms-backend/employee_departments.php?isCurrent=true'),
      ]);
      const [deptData, assignData] = await Promise.all([deptRes.json(), assignRes.json()]);
      setDepartments(Array.isArray(deptData) ? deptData.map(normalizeDept) : []);

      if (Array.isArray(assignData)) {
        const counts: Record<string, number> = {};
        assignData.forEach((a: any) => {
          counts[a.departmentId] = (counts[a.departmentId] || 0) + 1;
        });
        setEmpCounts(counts);
      }
    } catch { setDepartments([]);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRestricted) return;
    try {
      if (editingDept) {
        await fetch(DEPARTMENTS_API, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingDept.id, ...formData }) });
        setToastMessage('Department updated!');
      } else {
        await fetch(DEPARTMENTS_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        setToastMessage('Department created!');
      }
      setShowToast(true); resetForm(); loadDepartments();
    } catch { setToastMessage('Failed to save'); setShowToast(true); }
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ departmentCode: dept.departmentCode, departmentName: dept.departmentName, description: dept.description || '', parentDepartmentId: dept.parentDepartmentId || '', headOfDepartment: dept.headOfDepartment || '', isActive: dept.isActive });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (isRestricted || !confirm('Deactivate this department?')) return;
    try {
      await fetch(`${DEPARTMENTS_API}?id=${id}`, { method: 'DELETE' });
      setToastMessage('Department deactivated!'); setShowToast(true); loadDepartments();
    } catch { setToastMessage('Failed'); setShowToast(true); }
  };

  const resetForm = () => {
    setFormData({ departmentCode: '', departmentName: '', description: '', parentDepartmentId: '', headOfDepartment: '', isActive: true });
    setEditingDept(null); setShowForm(false);
  };

  const active = departments.filter(d => d.isActive);
  const inactive = departments.filter(d => !d.isActive);

  const pieData: { label: string; value: number; color: string }[] = active
    .map((d, i) => ({
      label: d.departmentName,
      value: empCounts[d.id] || 0,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
    }))
    .filter(d => d.value > 0);

  const totalEmployees = pieData.reduce((s, d) => s + d.value, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading departments...</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6 animate-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Department Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage organizational structure and hierarchy</p>
          </div>
          {!isRestricted && (
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all">
              <Plus className="w-4 h-4" /> Add Department
            </button>
          )}
        </div>

        {isRestricted && <RestrictionBanner message="This section is restricted to Super Admin and HR Admin roles only." />}

        {/* Stats + Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 grid grid-cols-2 gap-4 content-start">
            {[
              { label: 'Total Depts', value: departments.length, icon: Building2    },
              { label: 'Active',      value: active.length,      icon: CheckCircle2 },
              { label: 'Inactive',    value: inactive.length,    icon: XCircle      },
              { label: 'Employees',   value: totalEmployees,     icon: User         },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <PieChart className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Employee Distribution by Department</h3>
                <p className="text-xs text-slate-400">{totalEmployees} total employees across {pieData.length} active departments</p>
              </div>
            </div>

            {active.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-300 flex-col gap-2">
                <PieChart className="w-12 h-12" />
                <p className="text-sm text-slate-400">No active departments yet</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-56 h-56 flex-shrink-0">
                  <PieChartSVG data={pieData} />
                </div>
                <div className="flex-1 grid grid-cols-1 gap-2 w-full">
                  {active.map((dept, i) => {
                    const count = empCounts[dept.id] || 0;
                    const pct = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
                    return (
                      <div key={dept.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-4 h-4 rounded-sm flex-shrink-0 shadow-sm" style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{dept.departmentName}</p>
                          <p className="text-xs text-slate-400">{dept.departmentCode}</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-sm font-bold text-slate-700">{count}</span>
                          <span className="text-xs text-slate-400">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        {showForm && !isRestricted && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-0.5 bg-blue-600" />
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-bold text-slate-900">{editingDept ? 'Edit Department' : 'New Department'}</h2>
              </div>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Department Code *</label>
                  <Input value={formData.departmentCode} onChange={e => setFormData({ ...formData, departmentCode: e.target.value })} placeholder="DEPT001" required className="h-10 rounded-xl border-slate-200" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Department Name *</label>
                  <Input value={formData.departmentName} onChange={e => setFormData({ ...formData, departmentName: e.target.value })} placeholder="Computer Science" required className="h-10 rounded-xl border-slate-200" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Department description..." className="w-full min-h-[72px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Parent Department</label>
                  <select value={formData.parentDepartmentId} onChange={e => setFormData({ ...formData, parentDepartmentId: e.target.value })} className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:border-blue-400">
                    <option value="">No parent (Top level)</option>
                    {departments.filter(d => d.isActive && d.id !== editingDept?.id).map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">Head of Department (ID)</label>
                  <Input value={formData.headOfDepartment} onChange={e => setFormData({ ...formData, headOfDepartment: e.target.value })} placeholder="EMP001" className="h-10 rounded-xl border-slate-200" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded accent-blue-600" />
                  <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">Active department</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm} className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all">
                  {editingDept ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Department Cards */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-4">All Departments ({departments.length})</h2>
          {departments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 font-semibold">No departments yet</p>
              <p className="text-sm text-slate-400 mt-1">Create your first department to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
                  <div className="h-1.5 bg-blue-600" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${dept.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">{dept.departmentName}</h3>
                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">{dept.departmentCode}</p>
                    {dept.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{dept.description}</p>}
                    {dept.headOfDepartment && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                        <User className="w-3 h-3" /><span>Head: {dept.headOfDepartment}</span>
                      </div>
                    )}
                    {dept.parentDepartmentId && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                        <Hash className="w-3 h-3" />
                        <span>Sub-department</span>
                      </div>
                    )}

                    {dept.isActive && (
                      <div className="mb-4 p-2.5 bg-slate-50 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 flex-shrink-0">
                          <svg viewBox="0 0 32 32" className="w-8 h-8">
                            <circle cx="16" cy="16" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                            <circle cx="16" cy="16" r="14" fill="none"
                              stroke="#2563eb"
                              strokeWidth="4" strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 14}`}
                              strokeDashoffset={`${2 * Math.PI * 14 * (1 - (totalEmployees > 0 ? (empCounts[dept.id] || 0) / totalEmployees : 0))}`}
                              transform="rotate(-90 16 16)" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            {empCounts[dept.id] || 0} employee{(empCounts[dept.id] || 0) !== 1 ? 's' : ''}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {totalEmployees > 0 ? Math.round(((empCounts[dept.id] || 0) / totalEmployees) * 100) : 0}% of org
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <button onClick={() => handleEdit(dept)} disabled={isRestricted}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-xs font-semibold transition-colors disabled:opacity-40">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(dept.id)} disabled={isRestricted}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs font-semibold transition-colors disabled:opacity-40">
                        <Trash2 className="w-3.5 h-3.5" /> Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
