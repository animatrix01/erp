import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RestrictionBannerProps {
  message: string;
  className?: string;
}

export function RestrictionBanner({ message, className }: RestrictionBannerProps) {
  return (
    <div className={cn('bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3', className)}>
      <div className="w-8 h-8 bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <ShieldAlert className="w-4 h-4 text-amber-600" />
      </div>
      <div>
        <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Access Restricted</h3>
        <p className="text-sm text-amber-700 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
