'use client';

import { useEffect, useState } from 'react';
import { CertificationsForm } from '@/components/custom/certifications-form';
import { Certification } from '@/lib/types';
import { Toast } from '@/components/ui/toast';
import { Award, ShieldCheck, Clock, TrendingUp } from 'lucide-react';

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const loadCertifications = async () => {
      try {
        const response = await fetch('http://localhost/hrms-backend/certifications.php');
        const data = await response.json();
        const transformed = Array.isArray(data) ? data.map((c: any) => ({
          certificationName: c.certificationName,
          issuingOrganization: c.issuingOrganization,
          issueDate: c.issueDate,
          expiryDate: c.expiryDate || '',
          certificateNumber: c.certificateNumber || '',
        })) : [];
        setCertifications(transformed);
      } catch (error) {
        console.error('Failed to load certifications:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCertifications();
  }, []);

  const handleSubmit = async (data: Certification[]) => {
    try {
      const employeeResponse = await fetch('http://localhost/hrms-backend/employees.php');
      const employees = await employeeResponse.json();
      if (!Array.isArray(employees) || employees.length === 0) {
        setToastMessage('Please create an employee profile first');
        setShowToast(true);
        return;
      }
      const response = await fetch('http://localhost/hrms-backend/certifications_batch.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employees[0].id, certifications: data }),
      });
      if (response.ok) {
        setCertifications(data);
        setToastMessage('Certifications saved successfully!');
      } else {
        const err = await response.json();
        setToastMessage(`Error: ${err.error || 'Failed to save'}`);
      }
      setShowToast(true);
    } catch {
      setToastMessage('Failed to save certifications');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading certifications...</p>
        </div>
      </div>
    );
  }

  // compute stats
  const now = new Date();
  const active = certifications.filter(c => !c.expiryDate || new Date(c.expiryDate) > now).length;
  const expired = certifications.length - active;

  return (
    <>
      <div className="space-y-6 animate-in">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Professional Certifications</h1>
            <p className="text-sm text-slate-500 mt-1">Manage credentials, industry certifications, and qualifications</p>
          </div>
        </div>

        {/* Stats */}
        {certifications.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: certifications.length, gradient: 'from-amber-500 to-orange-600', icon: Award },
              { label: 'Active', value: active, gradient: 'from-emerald-500 to-teal-600', icon: ShieldCheck },
              { label: 'Expired', value: expired, gradient: 'from-red-500 to-rose-600', icon: Clock },
              { label: 'Orgs', value: new Set(certifications.map(c => c.issuingOrganization)).size, gradient: 'from-indigo-500 to-purple-600', icon: TrendingUp },
            ].map(stat => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-4 text-white shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">{stat.label}</p>
                  <stat.icon className="w-4 h-4 opacity-70" />
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        <CertificationsForm defaultValues={certifications} onSubmit={handleSubmit} />
      </div>

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
