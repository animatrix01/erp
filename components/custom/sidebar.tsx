'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, User, Building2, Users } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',          href: '/',                    icon: LayoutDashboard },
  { label: 'Profile Master',     href: '/profile-master',      icon: User            },
  { label: 'Departments',        href: '/departments',         icon: Building2       },
  { label: 'Employee Directory', href: '/employee-profiles',   icon: Users           },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      'w-64 flex flex-col flex-shrink-0 bg-slate-900 border-r border-slate-800',
      className
    )}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">HR Management</h2>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href === '/profile-master' && pathname.startsWith('/profile-master')) ||
            (item.href === '/employee-profiles' && pathname.startsWith('/employee-profiles'));
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">v1.0.0</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-400">Online</span>
        </div>
      </div>
    </aside>
  );
}
