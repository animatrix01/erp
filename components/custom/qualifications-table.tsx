'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { qualificationsArraySchema, QualificationsArrayFormData } from '@/lib/validations/qualification';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GraduationCap, Save } from 'lucide-react';
import { Qualification } from '@/lib/types';

const EDUCATION_LEVELS = [
  'Secondary (10th)', 'Higher Secondary (12th)',
  'Diploma', 'Certificate',
  'B.A.', 'B.Com.', 'B.Sc.', 'B.Tech.', 'B.E.', 'B.Ed.', 'BBA', 'BCA',
  'M.A.', 'M.Com.', 'M.Sc.', 'M.Tech.', 'M.E.', 'M.Ed.', 'MBA', 'MCA', 'M.Phil.',
  'Ph.D.', 'Post-Doctoral', 'Other',
];

const STUDY_MODES = ['Regular', 'Part-Time', 'Distance / Correspondence', 'Online'];

const SCORE_TYPES = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'cgpa',       label: 'CGPA'           },
  { value: 'grade',      label: 'Grade'           },
  { value: 'awarded',    label: 'Awarded / Honours'},
  { value: 'other',      label: 'Other'           },
];

const blankRow = (): Qualification => ({
  id: Date.now().toString(),
  degreeName: '', educationLevel: '', specialization: '', boardUniversity: '',
  institution: '', passingYear: new Date().getFullYear(),
  scoreType: 'percentage', scoreValue: '', percentage: 0, studyMode: 'Regular',
  isPHD: false,
  thesisTitle: '', researchGuide: '', researchArea: '', vivaDate: '',
});

interface QualificationsTableProps {
  defaultValues?: Qualification[];
  onSubmit: (data: Qualification[]) => void;
  onAddRef?: React.MutableRefObject<(() => void) | null>;
}

export function QualificationsTable({ defaultValues = [], onSubmit, onAddRef }: QualificationsTableProps) {
  const form = useForm<QualificationsArrayFormData>({
    resolver: zodResolver(qualificationsArraySchema),
    defaultValues: { qualifications: defaultValues.length > 0 ? defaultValues : [blankRow()] },
    mode: 'onBlur',
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'qualifications' });

  const handleAddRow = () => append(blankRow());
  if (onAddRef) onAddRef.current = handleAddRow;

  const handleSubmit = (data: QualificationsArrayFormData) => {
    onSubmit(data.qualifications.map(q => ({
      ...q,
      isPHD: q.degreeName?.toLowerCase().includes('ph.d') || q.degreeName?.toLowerCase().includes('phd') ||
             q.educationLevel === 'Ph.D.' || false,
      // sync scoreValue → percentage for backend compatibility
      percentage: q.scoreType === 'percentage' ? parseFloat(q.scoreValue || '0') || q.percentage : q.percentage,
    })));
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Educational Qualifications</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {fields.length} qualification{fields.length !== 1 ? 's' : ''} on file
            </p>
          </div>
          <button type="button" onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Qualification
          </button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {fields.map((field, index) => {
            const degreeNameVal  = form.watch(`qualifications.${index}.degreeName`);
            const eduLevelVal    = form.watch(`qualifications.${index}.educationLevel`);
            const scoreTypeVal   = form.watch(`qualifications.${index}.scoreType`);

            const isPHD =
              degreeNameVal?.toLowerCase().includes('ph.d') ||
              degreeNameVal?.toLowerCase().includes('phd') ||
              eduLevelVal === 'Ph.D.';

            return (
              <div key={field.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-0.5 bg-blue-600" />
                <div className="p-5">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                        <GraduationCap className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {degreeNameVal || `Qualification ${index + 1}`}
                      </span>
                      {isPHD && (
                        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                          Ph.D.
                        </span>
                      )}
                    </div>
                    <button type="button" onClick={() => remove(index)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>

                  {/* ── Row 1: Level + Degree + Specialization ── */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Education Level */}
                    <FormField control={form.control} name={`qualifications.${index}.educationLevel`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Education Level</FormLabel>
                          <Select onValueChange={f.onChange} value={f.value ?? ''}>
                            <FormControl>
                              <SelectTrigger className="field-input">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EDUCATION_LEVELS.map(l => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                    {/* Degree Name */}
                    <FormField control={form.control} name={`qualifications.${index}.degreeName`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Degree / Qualification *</FormLabel>
                          <FormControl>
                            <Input placeholder="B.Tech, M.Sc, Ph.D." className="field-input" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    {/* Specialization */}
                    <FormField control={form.control} name={`qualifications.${index}.specialization`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Specialization</FormLabel>
                          <FormControl>
                            <Input placeholder="Computer Science, Physics…" className="field-input" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>

                  {/* ── Row 2: Institution + Board/University + Study Mode ── */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField control={form.control} name={`qualifications.${index}.institution`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Institution / College *</FormLabel>
                          <FormControl>
                            <Input placeholder="College or University name" className="field-input" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={form.control} name={`qualifications.${index}.boardUniversity`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Board / University</FormLabel>
                          <FormControl>
                            <Input placeholder="Affiliating university" className="field-input" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={form.control} name={`qualifications.${index}.studyMode`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Study Mode</FormLabel>
                          <Select onValueChange={f.onChange} value={f.value ?? ''}>
                            <FormControl>
                              <SelectTrigger className="field-input">
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STUDY_MODES.map(m => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>

                  {/* ── Row 3: Passing Year + Score Type + Score Value ── */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name={`qualifications.${index}.passingYear`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Passing Year *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2020" className="field-input" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={form.control} name={`qualifications.${index}.scoreType`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Score Type</FormLabel>
                          <Select onValueChange={f.onChange} value={f.value ?? 'percentage'}>
                            <FormControl>
                              <SelectTrigger className="field-input">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SCORE_TYPES.map(s => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={form.control} name={`qualifications.${index}.scoreValue`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">
                            {scoreTypeVal === 'percentage' ? 'Percentage (%)' :
                             scoreTypeVal === 'cgpa'       ? 'CGPA'            :
                             scoreTypeVal === 'grade'      ? 'Grade'           :
                             scoreTypeVal === 'awarded'    ? 'Distinction / Honours' : 'Score / Result'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type={scoreTypeVal === 'percentage' || scoreTypeVal === 'cgpa' ? 'number' : 'text'}
                              step="0.01"
                              placeholder={
                                scoreTypeVal === 'percentage' ? '85.5' :
                                scoreTypeVal === 'cgpa'       ? '8.5'  :
                                scoreTypeVal === 'grade'      ? 'A+'   :
                                scoreTypeVal === 'awarded'    ? 'First Class with Distinction' : 'Score'
                              }
                              className="field-input" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>

                  {/* ── Ph.D. Section (shown when degree implies Ph.D.) ── */}
                  {isPHD && (
                    <div className="mt-4 pt-4 border-t border-violet-100">
                      <p className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" /> Ph.D. Research Details
                      </p>
                      <div className="grid grid-cols-1 gap-4">
                        <FormField control={form.control} name={`qualifications.${index}.thesisTitle`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="field-label">Thesis Title *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter thesis title" className="field-input" {...f} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField control={form.control} name={`qualifications.${index}.researchGuide`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel className="field-label">Research Guide *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Dr. Name" className="field-input" {...f} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />

                          <FormField control={form.control} name={`qualifications.${index}.researchArea`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel className="field-label">Research Area *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Research domain" className="field-input" {...f} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />

                          <FormField control={form.control} name={`qualifications.${index}.vivaDate`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel className="field-label">Viva / Defense Date</FormLabel>
                                <FormControl>
                                  <Input type="date" className="field-input" {...f} value={f.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => form.reset()} className="btn-secondary">Reset</button>
            <button type="submit" className="btn-primary">
              <Save className="w-3.5 h-3.5" /> Save Qualifications
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
