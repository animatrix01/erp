'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CertificationsForm } from '@/components/custom/certifications-form';
import { Certification } from '@/lib/types';
import { ArrowLeft, Award, ShieldCheck, Clock, Building } from 'lucide-react';
import { Toast } from '@/components/ui/toast';

export default function CertificationsPage() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id');
  const backHref = idFromUrl ? `/profile-master?id=${idFromUrl}` : '/profile-master';
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const toast = (msg: string) => { setToastMessage(msg); setShowToast(true); };

  const mapCert = (c: any): Certification => ({
    certificationName:   c.certificationName,
    issuingOrganization: c.issuingOrganization,
    issueDate:           c.issueDate,
    expiryDate:          c.expiryDate || '',
    certificateNumber:   c.certificateNumber || '',
    doesNotExpire:       !c.expiryDate, // If no expiry date, assume it doesn't expire
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost/hrms-backend/employees.php');
        const employees = await res.json();
        if (Array.isArray(employees) && employees.length > 0) {
          const empId = employees[0].id;
          setEmployeeId(empId);
          const cRes = await fetch(`http://localhost/hrms-backend/certifications.php?employeeId=${empId}`);
          const data = await cRes.json();
          setCertifications(Array.isArray(data) ? data.map(mapCert) : []);
        }
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (data: Certification[], files: Record<string, File>) => {
    if (!employeeId) {
      toast('Please save employee profile first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('employeeId', employeeId);

      data.forEach((cert, index) => {
        formData.append(`certifications[${index}][certificationName]`, cert.certificationName);
        formData.append(`certifications[${index}][issuingOrganization]`, cert.issuingOrganization);
        formData.append(
          `certifications[${index}][issueDate]`,
          cert.issueDate instanceof Date
            ? cert.issueDate.toISOString().split('T')[0]
            : String(cert.issueDate)
        );
        if (cert.expiryDate) {
          formData.append(
            `certifications[${index}][expiryDate]`,
            cert.expiryDate instanceof Date
              ? cert.expiryDate.toISOString().split('T')[0]
              : String(cert.expiryDate)
          );
        }
        if (cert.certificateNumber) {
          formData.append(`certifications[${index}][certificateNumber]`, cert.certificateNumber);
        }
        if (cert.credentialUrl) {
          formData.append(`certifications[${index}][credentialUrl]`, cert.credentialUrl);
        }
        formData.append(`certifications[${index}][doesNotExpire]`, cert.doesNotExpire ? '1' : '0');
      });

      Object.entries(files).forEach(([key, file]) => {
        const match = key.match(/cert_(\d+)/);
        if (match) formData.append(`cert_file_${match[1]}`, file);
      });

      const res = await fetch('http://localhost/hrms-backend/certifications_batch.php', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast('Certifications saved successfully');
        // Refresh with employeeId filter so we only get this employee's data
        const cRes = await fetch(`http://localhost/hrms-backend/certifications.php?employeeId=${employeeId}`);
        const refreshedData = await cRes.json();
        setCertifications(Array.isArray(refreshedData) ? refreshedData.map(mapCert) : []);
      } else {
        const error = await res.json();
        console.error('Save error:', error);
        toast('Failed to save certifications');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast('An error occurred while saving');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const now = new Date();
  const active = certifications.filter(
    (c) => !c.expiryDate || new Date(c.expiryDate as unknown as string) > now
  ).length;

  return (
    <>
      <div className="space-y-5 animate-in">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Certifications</h1>
            <p className="text-xs text-slate-500">Professional certifications and credentials</p>
          </div>
        </div>

        {certifications.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total',   value: certifications.length,                                              icon: Award      },
              { label: 'Active',  value: active,                                                             icon: ShieldCheck },
              { label: 'Expired', value: certifications.length - active,                                     icon: Clock      },
              { label: 'Issuers', value: new Set(certifications.map((c) => c.issuingOrganization)).size,     icon: Building   },
            ].map((s) => (
              <div key={s.label} className="stat-card flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
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
