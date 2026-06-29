'use client';

import { useEffect, useState } from 'react';
import { MedicalForm } from '@/components/custom/medical-form';
import { Toast } from '@/components/ui/toast';
import { useRole } from '@/hooks/use-role';
import { MedicalFormData } from '@/lib/validations/medical';
import { Heart, Phone, Users, Activity } from 'lucide-react';

export default function MedicalFamilyPage() {
  const [medicalData, setMedicalData] = useState<MedicalFormData | null>(null);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { hasAccess } = useRole();
  const isRestricted = !hasAccess(['super-admin', 'medical-staff']);

  useEffect(() => {
    const load = async () => {
      try {
        const empRes = await fetch('http://localhost/hrms-backend/employees.php');
        const employees = await empRes.json();
        if (!Array.isArray(employees) || employees.length === 0) { setLoading(false); return; }

        const emp = employees[0];
        setEmployeeId(emp.id);

        const [medRes, contRes, depRes] = await Promise.all([
          fetch(`http://localhost/hrms-backend/medical.php?employeeId=${emp.id}`),
          fetch(`http://localhost/hrms-backend/emergency_contacts.php?employeeId=${emp.id}`),
          fetch(`http://localhost/hrms-backend/dependents.php?employeeId=${emp.id}`),
        ]);
        const [med, contacts, deps] = await Promise.all([medRes.json(), contRes.json(), depRes.json()]);

        setMedicalData({
          bloodGroup:            med.length > 0 ? med[0].bloodGroup            : '',
          medicalHistory:        med.length > 0 ? med[0].medicalHistory  || '' : '',
          height:                med.length > 0 ? med[0].height                : undefined,
          weight:                med.length > 0 ? med[0].weight                : undefined,
          lastMedicalCheckup:    med.length > 0 ? med[0].lastMedicalCheckup || '' : '',
          disability:            med.length > 0 ? med[0].disability       || '' : '',
          physicallyHandicapped: med.length > 0 ? Boolean(med[0].physicallyHandicapped) : false,
          knownAllergies:        med.length > 0 ? med[0].knownAllergies   || '' : '',
          medicalNotes:          med.length > 0 ? med[0].medicalNotes     || '' : '',
          insurancePolicyNumber: med.length > 0 ? med[0].insurancePolicyNumber || '' : '',
          insuranceProvider:     med.length > 0 ? med[0].insuranceProvider     || '' : '',
          emergencyContacts: Array.isArray(contacts) ? contacts.map((c: any) => ({
            id: c.id, name: c.name, relationship: c.relationship, phone: c.phone,
            alternatePhone: c.alternatePhone || '', email: c.email || '',
            address: c.address || '', priority: c.priority || 1,
            bloodGroup: c.bloodGroup || '', contactType: c.contactType || 'general',
          })) : [],
          dependents: Array.isArray(deps) ? deps.map((d: any) => ({
            id: d.id, name: d.name, relationship: d.relationship,
            dateOfBirth: new Date(d.dateOfBirth), gender: d.gender || '',
            isDependent: d.isDependent, aadharNumber: d.aadharNumber || '',
            occupation: d.occupation || '', contactNumber: d.contactNumber || '',
          })) : [],
          allergies: [],
        });
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (data: MedicalFormData) => {
    if (isRestricted) return;
    try {
      await Promise.all([
        fetch('http://localhost/hrms-backend/medical.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId, bloodGroup: data.bloodGroup, medicalHistory: data.medicalHistory, height: data.height || null, weight: data.weight || null, lastMedicalCheckup: data.lastMedicalCheckup || null, disability: data.disability || null, physicallyHandicapped: data.physicallyHandicapped || false, knownAllergies: data.knownAllergies || null, medicalNotes: data.medicalNotes || null, insurancePolicyNumber: data.insurancePolicyNumber, insuranceProvider: data.insuranceProvider }) }),
        fetch('http://localhost/hrms-backend/emergency_contacts_batch.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId, contacts: data.emergencyContacts.map(c => ({ name: c.name, relationship: c.relationship, phone: c.phone, alternatePhone: c.alternatePhone || null, email: c.email || null, address: c.address || null, priority: c.priority || 1, bloodGroup: c.bloodGroup || null, contactType: c.contactType || 'general' })) }) }),
        fetch('http://localhost/hrms-backend/dependents_batch.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId, dependents: data.dependents.map(d => ({ name: d.name, relationship: d.relationship, dateOfBirth: d.dateOfBirth instanceof Date ? d.dateOfBirth.toISOString().split('T')[0] : d.dateOfBirth, gender: d.gender || null, isDependent: d.isDependent !== undefined ? d.isDependent : true, aadharNumber: d.aadharNumber || null, occupation: d.occupation || null, contactNumber: d.contactNumber || null })) }) }),
      ]);
      setMedicalData(data);
      setToastMessage('Medical information saved!');
      setShowToast(true);
    } catch {
      setToastMessage('Failed to save medical information');
      setShowToast(true);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading medical information...</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6 animate-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical & Family Information</h1>
          <p className="text-sm text-slate-500 mt-1">Health records, emergency contacts, and dependent information (Restricted Access)</p>
        </div>

        {medicalData && !isRestricted && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Blood Group', value: medicalData.bloodGroup || '—', gradient: 'from-rose-500 to-pink-600', icon: Activity },
              { label: 'Contacts', value: medicalData.emergencyContacts.length, gradient: 'from-orange-500 to-amber-600', icon: Phone },
              { label: 'Dependents', value: medicalData.dependents.length, gradient: 'from-violet-500 to-purple-600', icon: Users },
              { label: 'Insurance', value: medicalData.insurancePolicyNumber ? 'Active' : 'None', gradient: 'from-teal-500 to-emerald-600', icon: Heart },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-4 text-white shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">{s.label}</p>
                  <s.icon className="w-4 h-4 opacity-70" />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
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
