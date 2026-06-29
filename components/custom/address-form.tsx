'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressArraySchema, AddressArrayFormData } from '@/lib/validations/address';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, MapPin, Save } from 'lucide-react';

const EMPTY_ADDRESS = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  district: '',
  state: '',
  postalCode: '',
  country: 'India',
};

interface AddressFormProps {
  defaultValues?: any[];
  permanentSameAsCurrent?: boolean;
  onSubmit: (data: any[], permanentSameAsCurrent: boolean) => void;
}

export function AddressForm({
  defaultValues = [],
  permanentSameAsCurrent = false,
  onSubmit,
}: AddressFormProps) {
  const initial = defaultValues.length > 0 ? defaultValues.map(a => ({
    ...a,
    district: a.district || '',
  })) : [
    { id: 'current-1', addressType: 'current', ...EMPTY_ADDRESS },
    { id: 'permanent-1', addressType: 'permanent', ...EMPTY_ADDRESS },
  ];

  const [sameAsCurrent, setSameAsCurrent] = useState(permanentSameAsCurrent);

  const form = useForm<AddressArrayFormData>({
    resolver: zodResolver(addressArraySchema),
    defaultValues: { addresses: initial },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'addresses' });
  const watchedAddresses = useWatch({ control: form.control, name: 'addresses' });

  useEffect(() => {
    setSameAsCurrent(permanentSameAsCurrent);
  }, [permanentSameAsCurrent]);

  useEffect(() => {
    if (!sameAsCurrent || !watchedAddresses) return;

    const current = watchedAddresses.find(a => a?.addressType === 'current');
    const permanentIdx = watchedAddresses.findIndex(a => a?.addressType === 'permanent');
    if (!current || permanentIdx < 0) return;

    const permanent = watchedAddresses[permanentIdx];
    const synced = {
      ...current,
      id: permanent.id,
      addressType: 'permanent' as const,
    };

    const fieldsMatch = (
      ['addressLine1', 'addressLine2', 'city', 'district', 'state', 'postalCode', 'country'] as const
    ).every(key => permanent?.[key] === current?.[key]);

    if (!fieldsMatch) {
      form.setValue(`addresses.${permanentIdx}`, synced, { shouldDirty: true });
    }
  }, [sameAsCurrent, watchedAddresses, form]);

  const handleAdd = () => append({
    id: Date.now().toString(),
    addressType: 'correspondence',
    ...EMPTY_ADDRESS,
  });

  const isFieldReadOnly = (index: number) => {
    if (!sameAsCurrent) return false;
    return watchedAddresses?.[index]?.addressType === 'permanent';
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(d => onSubmit(d.addresses, sameAsCurrent))} className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Address Information</h3>
                <p className="text-xs text-slate-400 mt-0.5">{fields.length} address{fields.length !== 1 ? 'es' : ''} on file</p>
              </div>
              <button type="button" onClick={handleAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Address
              </button>
            </div>
          </div>
          {fields.map((field, index) => {
            const locked = isFieldReadOnly(index);
            const typeLabel = watchedAddresses?.[index]?.addressType === 'current'
              ? 'Current / Correspondence Address'
              : watchedAddresses?.[index]?.addressType === 'permanent'
                ? 'Permanent / Home Address'
                : `Address ${index + 1}`;

            return (
              <div key={field.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-0.5 bg-blue-600" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{typeLabel}</span>
                    </div>
                    {fields.length > 2 && (
                      <button type="button" onClick={() => remove(index)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <FormField control={form.control} name={`addresses.${index}.addressType`}
                      render={({ field: typeField }) => (
                        <FormItem>
                          <FormLabel className="field-label">Address Type *</FormLabel>
                          <Select
                            onValueChange={typeField.onChange}
                            value={typeField.value}
                            disabled={locked}
                          >
                            <FormControl><SelectTrigger className="field-input"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="permanent">Permanent</SelectItem>
                              <SelectItem value="current">Current</SelectItem>
                              <SelectItem value="correspondence">Correspondence</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    {[
                      { name: `addresses.${index}.addressLine1` as const, label: 'Address Line 1 *', placeholder: 'Street address' },
                      { name: `addresses.${index}.addressLine2` as const, label: 'Address Line 2', placeholder: 'Apartment, floor (optional)' },
                    ].map(f => (
                      <FormField key={f.name} control={form.control} name={f.name}
                        render={({ field: inputField }) => (
                          <FormItem>
                            <FormLabel className="field-label">{f.label}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={f.placeholder}
                                className={`field-input ${locked ? 'bg-slate-50 text-slate-500' : ''}`}
                                readOnly={locked}
                                {...inputField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                    ))}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { name: `addresses.${index}.city` as const, label: 'City *', placeholder: 'City' },
                        { name: `addresses.${index}.district` as const, label: 'District', placeholder: 'District' },
                        { name: `addresses.${index}.state` as const, label: 'State *', placeholder: 'State' },
                        { name: `addresses.${index}.postalCode` as const, label: 'Postal Code *', placeholder: '400001' },
                        { name: `addresses.${index}.country` as const, label: 'Country *', placeholder: 'India' },
                      ].map(f => (
                        <FormField key={f.name} control={form.control} name={f.name}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormLabel className="field-label">{f.label}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={f.placeholder}
                                  className={`field-input ${locked ? 'bg-slate-50 text-slate-500' : ''}`}
                                  readOnly={locked}
                                  {...inputField}
                                  value={inputField.value ?? ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer px-1">
            <input
              type="checkbox"
              checked={sameAsCurrent}
              onChange={e => setSameAsCurrent(e.target.checked)}
              className="rounded border-slate-300"
            />
            Permanent same as Current
          </label>

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => form.reset()} className="btn-secondary">Reset</button>
            <button type="submit" className="btn-primary"><Save className="w-3.5 h-3.5" /> Save Addresses</button>
          </div>
        </form>
      </Form>
    </div>
  );
}
