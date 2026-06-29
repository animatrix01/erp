'use client';

import { useRole } from '@/hooks/use-role';
import { UserRole } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roleConfig: Record<UserRole, { label: string }> = {
  'super-admin':   { label: 'Super Admin'   },
  'hr-admin':      { label: 'HR Admin'      },
  'employee':      { label: 'Employee'      },
  'medical-staff': { label: 'Medical Staff' },
};

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
      <SelectTrigger className="w-36 h-8 rounded-lg border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors focus:ring-blue-500">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-lg border-slate-200 shadow-md">
        {(Object.entries(roleConfig) as [UserRole, { label: string }][]).map(([key, val]) => (
          <SelectItem key={key} value={key} className="text-xs font-medium">
            {val.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
