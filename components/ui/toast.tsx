'use client';

import * as React from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-institutional-800 text-white px-4 py-3 rounded-md shadow-lg animate-in slide-in-from-bottom-5 z-50">
      <p className="text-sm">{message}</p>
    </div>
  );
}
