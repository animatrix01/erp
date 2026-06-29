'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { medicalSchema, MedicalFormData } from '@/lib/validations/medical';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';
import { RestrictionBanner } from './restriction-banner';

export function MedicalForm({ defaultValues, onSubmit, isRestricted }: { defaultValues?: MedicalFormData; onSubmit: (data: MedicalFormData) => void; isRestricted: boolean }) {
  const form = useForm<MedicalFormData>({
    resolver: zodResolver(medicalSchema),
    defaultValues: defaultValues || { emergencyContacts: [], allergies: [], bloodGroup: '', dependents: [], medicalHistory: '', height: undefined, weight: undefined, lastMedicalCheckup: '', disability: '', physicallyHandicapped: false, knownAllergies: '', medicalNotes: '', insurancePolicyNumber: '', insuranceProvider: '' },
    mode: 'onBlur',
  });
  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({ control: form.control, name: 'emergencyContacts' });
  const { fields: dependentFields, append: appendDependent, remove: removeDependent } = useFieldArray({ control: form.control, name: 'dependents' });

  const cls = `field-input ${isRestricted ? 'opacity-60 cursor-not-allowed' : ''}`;

  const handleFormSubmit = (data: MedicalFormData) => {
    console.log('Form submitted with data:', data);
    console.log('isRestricted:', isRestricted);
    onSubmit(data);
  };

  const handleFormError = (errors: any) => {
    console.log('Form validation errors:', errors);
  };

  return (
    <div className="space-y-4">
      {isRestricted && <RestrictionBanner message="You do not have permission to view or edit medical and family information. This section is restricted to Super Admin and Medical Staff roles only." />}

      {/* Basic medical */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-0.5 bg-blue-600" />
        <div className="p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Basic Medical Information</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'bloodGroup' as const,            label: 'Blood Group *',         placeholder: 'O+' },
                  { name: 'height' as const,                label: 'Height (cm)',            placeholder: '170.5', type: 'number' },
                  { name: 'weight' as const,                label: 'Weight (kg)',            placeholder: '70.5',  type: 'number' },
                  { name: 'lastMedicalCheckup' as const,    label: 'Last Medical Checkup',   placeholder: '',      type: 'date'   },
                  { name: 'insurancePolicyNumber' as const,  label: 'Insurance Policy No.',  placeholder: 'POL123456' },
                  { name: 'insuranceProvider' as const,     label: 'Insurance Provider',     placeholder: 'XYZ Insurance Co.' },
                ].map(f => (
                  <FormField key={f.name} control={form.control} name={f.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label">{f.label}</FormLabel>
                        <FormControl><Input type={f.type || 'text'} placeholder={f.placeholder} className={cls} {...field} value={field.value || ''} disabled={isRestricted} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                ))}

                {/* Disability */}
                <FormField control={form.control} name="disability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Disability (if any)</FormLabel>
                      <FormControl>
                        <Input placeholder="Visual impairment, locomotor disability..." className={cls} {...field} value={field.value ?? ''} disabled={isRestricted} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                {/* Physically Handicapped checkbox */}
                <FormField control={form.control} name="physicallyHandicapped"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">&nbsp;</FormLabel>
                      <div className={`flex items-center gap-2.5 h-10 px-3 border rounded-lg cursor-pointer
                        ${isRestricted ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                        onClick={() => !isRestricted && field.onChange(!field.value)}>
                        <input type="checkbox" id="physicallyHandicapped"
                          checked={!!field.value}
                          onChange={e => !isRestricted && field.onChange(e.target.checked)}
                          disabled={isRestricted}
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                        <label htmlFor="physicallyHandicapped"
                          className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                          Physically Handicapped
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                {/* Medical History */}
                <FormField control={form.control} name="medicalHistory"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="field-label">Medical History</FormLabel>
                      <FormControl>
                        <textarea placeholder="Pre-existing conditions, past surgeries..." disabled={isRestricted}
                          className={`w-full min-h-[72px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${isRestricted ? 'opacity-60 cursor-not-allowed' : ''}`}
                          {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                {/* Known Allergies */}
                <FormField control={form.control} name="knownAllergies"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="field-label">Known Allergies</FormLabel>
                      <FormControl>
                        <textarea placeholder="Penicillin, peanuts, dust mites..." disabled={isRestricted}
                          className={`w-full min-h-[60px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${isRestricted ? 'opacity-60 cursor-not-allowed' : ''}`}
                          {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                {/* Medical Notes */}
                <FormField control={form.control} name="medicalNotes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="field-label">Medical Notes / Remarks</FormLabel>
                      <FormControl>
                        <textarea placeholder="Additional notes for medical staff..." disabled={isRestricted}
                          className={`w-full min-h-[60px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${isRestricted ? 'opacity-60 cursor-not-allowed' : ''}`}
                          {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
              </div>

              {/* Emergency Contacts */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Emergency Contacts ({contactFields.length})</p>
                  <button type="button" disabled={isRestricted}
                    onClick={() => appendContact({ id: Date.now().toString(), name: '', relationship: '', phone: '', bloodGroup: '', contactType: 'general' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40">
                    <Plus className="w-3.5 h-3.5" /> Add Contact
                  </button>
                </div>
                {contactFields.map((field, index) => (
                  <div key={field.id} className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-500">Contact {index + 1}</span>
                      <button type="button" onClick={() => removeContact(index)} disabled={isRestricted}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold disabled:opacity-40">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { name: `emergencyContacts.${index}.name` as const,         label: 'Name *',         placeholder: 'Full name' },
                        { name: `emergencyContacts.${index}.relationship` as const,  label: 'Relationship *', placeholder: 'Spouse, Parent...' },
                        { name: `emergencyContacts.${index}.phone` as const,         label: 'Phone *',        placeholder: '+919876543210' },
                      ].map(f => (
                        <FormField key={f.name} control={form.control} name={f.name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="field-label">{f.label}</FormLabel>
                              <FormControl><Input placeholder={f.placeholder} className={cls} {...field} disabled={isRestricted} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <FormField control={form.control} name={`emergencyContacts.${index}.bloodGroup`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="field-label">Blood Group</FormLabel>
                            <FormControl>
                              <Input placeholder="B+" className={cls} {...field} value={field.value ?? ''} disabled={isRestricted} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      <FormField control={form.control} name={`emergencyContacts.${index}.contactType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="field-label">Contact Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || 'general'} disabled={isRestricted}>
                              <FormControl>
                                <SelectTrigger className={cls}><SelectValue placeholder="Select type" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="medical">Medical</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Dependents */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dependents & Family ({dependentFields.length})</p>
                  <button type="button" disabled={isRestricted}
                    onClick={() => appendDependent({ id: Date.now().toString(), name: '', relationship: '', dateOfBirth: new Date(), occupation: '', contactNumber: '' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40">
                    <Plus className="w-3.5 h-3.5" /> Add Dependent
                  </button>
                </div>
                {dependentFields.map((field, index) => (
                  <div key={field.id} className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-500">Dependent {index + 1}</span>
                      <button type="button" onClick={() => removeDependent(index)} disabled={isRestricted}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold disabled:opacity-40">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { name: `dependents.${index}.name` as const,         label: 'Name *',         placeholder: 'Full name' },
                        { name: `dependents.${index}.relationship` as const,  label: 'Relationship *', placeholder: 'Son, Daughter...' },
                        { name: `dependents.${index}.occupation` as const,    label: 'Occupation',     placeholder: 'School Teacher (Govt.)' },
                      ].map(f => (
                        <FormField key={f.name} control={form.control} name={f.name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="field-label">{f.label}</FormLabel>
                              <FormControl><Input placeholder={f.placeholder} className={cls} {...field} value={field.value ?? ''} disabled={isRestricted} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                      ))}
                      <FormField control={form.control} name={`dependents.${index}.dateOfBirth`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="field-label">Date of Birth *</FormLabel>
                            <FormControl>
                              <Input type="date" className={cls} {...field} disabled={isRestricted}
                                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (field.value || '')} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      <FormField control={form.control} name={`dependents.${index}.contactNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="field-label">Contact Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+919876543210" className={cls} {...field} value={field.value ?? ''} disabled={isRestricted} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                    </div>
                  </div>
                ))}
              </div>

              {!isRestricted && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => form.reset()} className="btn-secondary">Reset</button>
                  <button type="submit" className="btn-primary"><Save className="w-3.5 h-3.5" /> Save Medical Information</button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
