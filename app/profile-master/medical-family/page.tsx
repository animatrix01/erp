'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MedicalForm } from '@/components/custom/medical-form';
import { Toast } from '@/components/ui/toast';
import { useRole } from '@/hooks/use-role';
import { MedicalFormData } from '@/lib/validations/medical';
import { ArrowLeft, Heart, Phone, Users, ShieldCheck } from 'lucide-react';

export default function MedicalFamilyPage() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id');
  const backHref = idFromUrl ? `/profile-master?id=${idFromUrl}` : '/profile-master';
  const [medicalData, setMedicalData] = useState<MedicalFormData | null>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { hasAccess } = useRole();
  const isRestricted = !hasAccess(['super-admin', 'medical-staff']);

  console.log('Medical page - hasAccess result:', hasAccess(['super-admin', 'medical-staff']));
  console.log('Medical page - isRestricted:', isRestricted);

  useEffect(() => {
    const load = async () => {
      try {
        const empRes = await fetch('http://localhost/hrms-backend/employees.php');
        const employees = await empRes.json();
        if (!Array.isArray(employees) || employees.length === 0) { setLoading(false); return; }
        const emp = employees[0]; setEmployeeId(emp.id);
        
        const [mRes, contRes, depRes] = await Promise.all([
          fetch(`http://localhost/hrms-backend/medical.php?employeeId=${emp.id}`),
          fetch(`http://localhost/hrms-backend/emergency_contacts.php?employeeId=${emp.id}`),
          fetch(`http://localhost/hrms-backend/dependents.php?employeeId=${emp.id}`),
        ]);
        const [mData, contacts, deps] = await Promise.all([mRes.json(), contRes.json(), depRes.json()]);
        
        console.log('Fetched medical data:', mData);
        console.log('Fetched contacts:', contacts);
        console.log('Fetched dependents:', deps);
        
        setMedicalData({
          bloodGroup:            mData.length > 0 ? mData[0].bloodGroup            : '',
          medicalHistory:        mData.length > 0 ? mData[0].medicalHistory  || '' : '',
          height:                mData.length > 0 ? mData[0].height                : undefined,
          weight:                mData.length > 0 ? mData[0].weight                : undefined,
          lastMedicalCheckup:    mData.length > 0 ? mData[0].lastMedicalCheckup || '' : '',
          disability:            mData.length > 0 ? mData[0].disability       || '' : '',
          physicallyHandicapped: mData.length > 0 ? Boolean(mData[0].physicallyHandicapped) : false,
          knownAllergies:        mData.length > 0 ? mData[0].knownAllergies   || '' : '',
          medicalNotes:          mData.length > 0 ? mData[0].medicalNotes     || '' : '',
          insurancePolicyNumber: mData.length > 0 ? mData[0].insurancePolicyNumber || '' : '',
          insuranceProvider:     mData.length > 0 ? mData[0].insuranceProvider     || '' : '',
          emergencyContacts: Array.isArray(contacts) ? contacts.map((c: any) => ({
            id: c.id, name: c.name, relationship: c.relationship, phone: c.phone,
            alternatePhone: c.alternatePhone || '', email: c.email || '', address: c.address || '',
            priority: c.priority || 1, bloodGroup: c.bloodGroup || '',
            contactType: c.contactType || 'general',
          })) : [],
          dependents: Array.isArray(deps) ? deps.map((d: any) => ({
            id: d.id,
            name: d.name,
            relationship: d.relationship,
            dateOfBirth: d.dateOfBirth, // Keep as string from database
            gender: d.gender && ['male', 'female', 'other'].includes(d.gender.toLowerCase()) ? d.gender.toLowerCase() : '',
            isDependent: d.isDependent !== undefined ? Boolean(d.isDependent) : true,
            aadharNumber: d.aadharNumber || '',
            occupation: d.occupation || '',
            contactNumber: d.contactNumber || '',
          })) : [],
          allergies: [],
        });
      } catch (error) {
        console.error('Load error:', error);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (data: MedicalFormData) => {
    if (isRestricted || !employeeId) return;
    
    try {
      const [medicalRes, contactsRes, dependentsRes] = await Promise.all([
        fetch('http://localhost/hrms-backend/medical.php', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            bloodGroup:            data.bloodGroup,
            medicalHistory:        data.medicalHistory,
            height:                data.height        || null,
            weight:                data.weight        || null,
            lastMedicalCheckup:    data.lastMedicalCheckup    || null,
            disability:            data.disability            || null,
            physicallyHandicapped: data.physicallyHandicapped || false,
            knownAllergies:        data.knownAllergies        || null,
            medicalNotes:          data.medicalNotes          || null,
            insurancePolicyNumber: data.insurancePolicyNumber,
            insuranceProvider:     data.insuranceProvider,
          }),
        }),
        fetch('http://localhost/hrms-backend/emergency_contacts_batch.php', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId, contacts: data.emergencyContacts.map(c => ({
            name: c.name, relationship: c.relationship, phone: c.phone,
            alternatePhone: c.alternatePhone || null, email: c.email || null,
            address: c.address || null, priority: c.priority || 1,
            bloodGroup: c.bloodGroup || null, contactType: c.contactType || 'general',
          })) }),
        }),
        fetch('http://localhost/hrms-backend/dependents_batch.php', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId, dependents: data.dependents.map(d => ({
            name: d.name, relationship: d.relationship,
            dateOfBirth: d.dateOfBirth instanceof Date ? d.dateOfBirth.toISOString().split('T')[0] : d.dateOfBirth,
            gender: d.gender || null, isDependent: d.isDependent !== undefined ? d.isDependent : true,
            aadharNumber: d.aadharNumber || null, occupation: d.occupation || null,
            contactNumber: d.contactNumber || null,
          })) }),
        }),
      ]);

      // Check if all requests succeeded
      if (!medicalRes.ok || !contactsRes.ok || !dependentsRes.ok) {
        const errors = await Promise.all([
          medicalRes.ok ? null : medicalRes.json(),
          contactsRes.ok ? null : contactsRes.json(),
          dependentsRes.ok ? null : dependentsRes.json(),
        ]);
        console.error('Save errors:', errors);
        setToastMessage('Failed to save some information. Check console.');
        setShowToast(true);
        return;
      }

      setMedicalData(data); 
      setToastMessage('Medical information saved!'); 
      setShowToast(true);
    } catch (error) {
      console.error('Submit error:', error);
      setToastMessage('An error occurred while saving.');
      setShowToast(true);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <>
      <div className="space-y-5 animate-in">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Medical & Family</h1>
            <p className="text-xs text-slate-500">Health records, emergency contacts and dependents</p>
          </div>
        </div>

        {medicalData && !isRestricted && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Blood Group', value: medicalData.bloodGroup || '—',                        icon: Heart     },
              { label: 'Contacts',    value: medicalData.emergencyContacts.length,                 icon: Phone     },
              { label: 'Dependents',  value: medicalData.dependents.length,                        icon: Users     },
              { label: 'Insurance',   value: medicalData.insurancePolicyNumber ? 'Active' : 'None', icon: ShieldCheck },
            ].map(s => (
              <div key={s.label} className="stat-card flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <MedicalForm defaultValues={medicalData ?? undefined} onSubmit={handleSubmit} isRestricted={isRestricted} />
      </div>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
