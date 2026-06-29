'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/lib/types';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  hasAccess: (requiredRoles: UserRole[]) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('employee');

  const hasAccess = (requiredRoles: UserRole[]) => {
    return requiredRoles.includes(role);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, hasAccess }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
