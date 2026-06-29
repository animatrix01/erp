'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employmentArraySchema, EmploymentArrayFormData } from '@/lib/validations/employment';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Briefcase, Save } from 'lucide-react';
import { EmploymentRecord } from '@/lib/types';
import { calculateExperience } from '@/lib/utils/date';

const EMPLOYMENT_TYPES = [
  'Full-Time', 'Part-Time', 'Contract', 'Consultant',
  'Internship', 'Visiting / Adjunct', 'Ad-hoc', 'Other',
];

const blankRow = () => ({
  id: Date.now().toString(),
  organizationName: '',
  designation: '',
  department: '',
  employmentType: 'Full-Time',
  fromDate: new Date(),
  toDate: new Date() as Date | null,
  isCurrent: false,
  totalExperienceYears: 0,
});

export function EmploymentTable({
  defaultValues = [],
  onSubmit,
}: {
  defaultValues?: EmploymentRecord[];
  onSubmit: (data: EmploymentRecord[]) => void;
}) {
  const form = useForm<EmploymentArrayFormData>({
    resolver: zodResolver(employmentArraySchema),
    defaultValues: { employmentHistory: defaultValues.length > 0 ? defaultValues : [blankRow()] },
    mode: 'onBlur',
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'employmentHistory' });

  const handleAdd = () => append(blankRow());

  const handleSubmit = (data: EmploymentArrayFormData) => {
    onSubmit(
      data.employmentHistory.map(r => ({
        ...r,
        fromDate: new Date(r.fromDate),
        toDate: r.isCurrent ? null : (r.toDate ? new Date(r.toDate) : null),
        totalExperienceYears: r.isCurrent
          ? calculateExperience(new Date(r.fromDate), new Date())
          : calculateExperience(new Date(r.fromDate), r.toDate ? new Date(r.toDate) : new Date()),
      }))
    );
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Employment History</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {fields.length} record{fields.length !== 1 ? 's' : ''} on file
            </p>
          </div>
          <button type="button" onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Record
          </button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {fields.map((field, index) => {
            const fromDate  = form.watch(`employmentHistory.${index}.fromDate`);
            const toDate    = form.watch(`employmentHistory.${index}.toDate`);
            const isCurrent = form.watch(`employmentHistory.${index}.isCurrent`);
            const experience = calculateExperience(
              new Date(fromDate),
              isCurrent ? new Date() : (toDate ? new Date(toDate) : new Date())
            );

            return (
              <div key={field.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-0.5 bg-blue-600" />
                <div className="p-5">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                        <Briefcase className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {form.watch(`employmentHistory.${index}.organizationName`) || `Record ${index + 1}`}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <button type="button" onClick={() => remove(index)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>

                  {/* ── Row 1: Org + Designation + Department ── */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField control={form.control} name={`employmentHistory.${index}.organizationName`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Organization *</FormLabel>
                          <FormControl>
                            <Input placeholder="Organization name" className="field-input" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={form.control} name={`employmentHistory.${index}.designation`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Designation *</FormLabel>
                          <FormControl>
                            <Input placeholder="Job title / role" className="field-input" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={form.control} name={`employmentHistory.${index}.department`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Department</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Computer Science" className="field-input" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>

                  {/* ── Row 2: Employment Type + From Date + To Date / isCurrent ── */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField control={form.control} name={`employmentHistory.${index}.employmentType`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Employment Type</FormLabel>
                          <Select onValueChange={f.onChange} value={f.value ?? 'Full-Time'}>
                            <FormControl>
                              <SelectTrigger className="field-input">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EMPLOYMENT_TYPES.map(t => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={form.control} name={`employmentHistory.${index}.fromDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">From Date *</FormLabel>
                          <FormControl>
                            <Input type="date" className="field-input" {...f}
                              value={f.value instanceof Date ? f.value.toISOString().split('T')[0] : f.value as string ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={form.control} name={`employmentHistory.${index}.toDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">
                            To Date {isCurrent ? '(disabled — current job)' : '*'}
                          </FormLabel>
                          <FormControl>
                            <Input type="date" className="field-input" {...f}
                              disabled={!!isCurrent}
                              value={isCurrent ? '' : (f.value instanceof Date ? f.value.toISOString().split('T')[0] : (f.value as string | null | undefined) ?? '')} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>

                  {/* ── Row 3: isCurrent checkbox + Experience ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* isCurrent checkbox */}
                    <FormField control={form.control} name={`employmentHistory.${index}.isCurrent`}
                      render={({ field: f }) => (
                        <FormItem>
                          <div className="flex items-center gap-2.5 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                            onClick={() => f.onChange(!f.value)}>
                            <input
                              type="checkbox"
                              checked={!!f.value}
                              onChange={e => {
                                f.onChange(e.target.checked);
                                if (e.target.checked) {
                                  form.setValue(`employmentHistory.${index}.toDate`, null);
                                }
                              }}
                              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                              id={`isCurrent-${index}`}
                            />
                            <label htmlFor={`isCurrent-${index}`}
                              className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                              Currently Working Here
                            </label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />

                    {/* Auto-calculated experience */}
                    <div>
                      <p className="field-label">Experience (auto-calculated)</p>
                      <div className="flex items-center gap-2 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-sm font-bold text-slate-900">{experience.toFixed(1)} yrs</span>
                        <span className="text-xs text-slate-400">
                          {isCurrent ? 'till today' : 'based on dates'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => form.reset()} className="btn-secondary">Reset</button>
            <button type="submit" className="btn-primary">
              <Save className="w-3.5 h-3.5" /> Save Employment History
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
