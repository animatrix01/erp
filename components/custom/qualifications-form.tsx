'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  qualificationsFormSchema,
  QualificationsFormData,
  QUALIFICATION_LEVELS,
  QualificationLevel,
} from '@/lib/validations/qualification';
import { Qualification } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { GraduationCap, Save, Upload, Eye, Check, Loader2 } from 'lucide-react';

const BACKEND = 'http://localhost/hrms-backend/';

const SCORE_TYPES = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'cgpa',       label: 'CGPA'           },
  { value: 'grade',      label: 'Grade'           },
  { value: 'awarded',    label: 'Awarded / Honours'},
  { value: 'other',      label: 'Other'           },
] as const;

const STUDY_MODES = ['Regular', 'Part-Time', 'Distance / Correspondence', 'Online'] as const;

const TIER_META: Record<QualificationLevel, { label: string }> = {
  '10th': { label: '10th (Secondary)'        },
  '12th': { label: '12th (Higher Secondary)' },
  'UG':   { label: 'Under-Graduation (UG)'   },
  'PG':   { label: 'Post-Graduation (PG)'    },
  'PhD':  { label: 'Ph.D. / Doctorate'       },
};

const emptyTier = (level: QualificationLevel) => ({
  level,
  degreeName: '', specialization: '', institution: '', boardUniversity: '',
  passingYear: '' as unknown as number,
  scoreType: 'percentage' as const,
  scoreValue: '',
  percentage: '' as unknown as number,
  studyMode: 'Regular',
  thesisTitle: '', researchGuide: '', researchArea: '', vivaDate: '',
  documentUrl: '', documentFile: undefined,
});

// Build form defaultValues from the flat array returned by the API
function buildDefaults(data: Qualification[]): QualificationsFormData {
  const base: QualificationsFormData = {
    '10th': emptyTier('10th'),
    '12th': emptyTier('12th'),
    'UG':   emptyTier('UG'),
    'PG':   emptyTier('PG'),
    'PhD':  emptyTier('PhD'),
  };
  for (const q of data) {
    const lvl = q.level as QualificationLevel;
    if (!QUALIFICATION_LEVELS.includes(lvl)) continue;
    base[lvl] = {
      level:           lvl,
      degreeName:      q.degreeName      || '',
      specialization:  q.specialization  || '',
      institution:     q.institution     || '',
      boardUniversity: q.boardUniversity || '',
      passingYear:     q.passingYear     || ('' as unknown as number),
      scoreType:       (q.scoreType as any) || 'percentage',
      scoreValue:      q.scoreValue      || '',
      percentage:      q.percentage      || ('' as unknown as number),
      studyMode:       q.studyMode       || 'Regular',
      thesisTitle:     q.thesisTitle     || '',
      researchGuide:   q.researchGuide   || '',
      researchArea:    q.researchArea    || '',
      vivaDate:        q.vivaDate        || '',
      documentUrl:     q.documentUrl     || '',
      documentFile:    undefined,
    };
  }
  return base;
}

interface QualificationsFormProps {
  defaultValues?: Qualification[];
  saveVersion?: number; // bumped by parent after each successful save to force reset
  onSubmit: (formData: FormData) => Promise<void>;
}

export function QualificationsForm({ defaultValues = [], saveVersion = 0, onSubmit }: QualificationsFormProps) {
  const [fileNames, setFileNames]   = useState<Partial<Record<QualificationLevel, string>>>({});
  const [fileMap, setFileMap]       = useState<Partial<Record<QualificationLevel, File>>>({});
  const [isSaved, setIsSaved]       = useState(false);
  const timerRef                    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<QualificationsFormData>({
    resolver: zodResolver(qualificationsFormSchema),
    defaultValues: buildDefaults(defaultValues),
    mode: 'onBlur',
  });

  // Re-populate on initial load and after every successful save
  useEffect(() => {
    form.reset(buildDefaults(defaultValues));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveVersion]); // tied to saveVersion, not reference equality of the array

  const handleFileChange = (level: QualificationLevel, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileMap((prev)   => ({ ...prev, [level]: file }));
    setFileNames((prev) => ({ ...prev, [level]: file.name }));
  };

  const handleFormSubmit = async (data: QualificationsFormData) => {
    const fd = new FormData();
    // employeeId is appended by the page — we just build the per-tier data
    for (const level of QUALIFICATION_LEVELS) {
      const tier = data[level];
      fd.append(`quals[${level}][degreeName]`,      tier.degreeName      || '');
      fd.append(`quals[${level}][specialization]`,  tier.specialization  || '');
      fd.append(`quals[${level}][institution]`,     tier.institution     || '');
      fd.append(`quals[${level}][boardUniversity]`, tier.boardUniversity || '');
      fd.append(`quals[${level}][passingYear]`,     String(tier.passingYear  || ''));
      fd.append(`quals[${level}][scoreType]`,       tier.scoreType       || 'percentage');
      fd.append(`quals[${level}][scoreValue]`,      tier.scoreValue      || '');
      fd.append(`quals[${level}][percentage]`,      String(tier.percentage   || ''));
      fd.append(`quals[${level}][studyMode]`,       tier.studyMode       || '');
      fd.append(`quals[${level}][thesisTitle]`,     tier.thesisTitle     || '');
      fd.append(`quals[${level}][researchGuide]`,   tier.researchGuide   || '');
      fd.append(`quals[${level}][researchArea]`,    tier.researchArea    || '');
      fd.append(`quals[${level}][vivaDate]`,        tier.vivaDate        || '');
      // Pass existing URL so PHP can keep it if no new file
      fd.append(`quals[${level}][existingDocumentUrl]`, tier.documentUrl || '');
      // Attach new file if selected
      if (fileMap[level]) {
        fd.append(`qual_doc_${level}`, fileMap[level]!);
      }
    }

    await onSubmit(fd);
    setIsSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">

        {QUALIFICATION_LEVELS.map((level) => {
          const meta      = TIER_META[level];
          const isPhD       = level === 'PhD';
          const scoreType   = form.watch(`${level}.scoreType`);
          const docUrl      = form.watch(`${level}.documentUrl`);
          const hasData     = !!(form.watch(`${level}.institution`));

          return (
            <div
              key={level}
              className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all
                ${hasData ? 'border-blue-600' : 'border-slate-200'}`}
            >
              {/* Uniform blue accent bar */}
              <div className="h-0.5 bg-blue-600" />

              <div className="p-5">
                {/* Card header */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{meta.label}</h3>
                    {!hasData && (
                      <p className="text-xs text-slate-400">Not filled — leave blank to skip</p>
                    )}
                  </div>
                  {hasData && (
                    <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                      Filled
                    </span>
                  )}
                </div>

                {/* Row 1: Degree + Specialization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name={`${level}.degreeName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label">
                          {isPhD ? 'Degree / Doctorate Title' : 'Degree / Certificate'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={isPhD ? 'Ph.D. in Computer Science' : 'B.Tech, M.Sc…'}
                            className="field-input" {...field} value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`${level}.specialization`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label">Specialization / Stream</FormLabel>
                        <FormControl>
                          <Input placeholder="Science, Commerce, CS…" className="field-input" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 2: Institution + Board / University */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name={`${level}.institution`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label">Institution / School / College</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of institution" className="field-input" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`${level}.boardUniversity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label">Board / University</FormLabel>
                        <FormControl>
                          <Input placeholder="CBSE, Nagpur University…" className="field-input" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 3: Passing Year + Study Mode + Score Type + Score */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name={`${level}.passingYear`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label">Passing Year</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2020" className="field-input" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`${level}.studyMode`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label">Study Mode</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? 'Regular'}>
                          <FormControl>
                            <SelectTrigger className="field-input">
                              <SelectValue placeholder="Mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STUDY_MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`${level}.scoreType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label">Score Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? 'percentage'}>
                          <FormControl>
                            <SelectTrigger className="field-input">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SCORE_TYPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`${level}.scoreValue`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="field-label">
                          {scoreType === 'cgpa' ? 'CGPA' : scoreType === 'grade' ? 'Grade' : scoreType === 'awarded' ? 'Honours' : 'Score / %'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={scoreType === 'percentage' || scoreType === 'cgpa' ? 'number' : 'text'}
                            step="0.01"
                            placeholder={scoreType === 'cgpa' ? '8.5' : '85.5'}
                            className="field-input" {...field} value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Ph.D. extras */}
                {isPhD && (
                  <div className="mt-2 pt-4 border-t border-emerald-100 space-y-4">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Ph.D. Research Details</p>
                    <FormField
                      control={form.control}
                      name="PhD.thesisTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="field-label">Thesis Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Full title of the doctoral thesis" className="field-input" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="PhD.researchGuide" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="field-label">Research Guide</FormLabel>
                          <FormControl><Input placeholder="Dr. Name" className="field-input" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="PhD.researchArea" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="field-label">Research Area</FormLabel>
                          <FormControl><Input placeholder="Domain / area" className="field-input" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="PhD.vivaDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="field-label">Viva / Defense Date</FormLabel>
                          <FormControl><Input type="date" className="field-input" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                )}

                {/* Document upload row */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    Marksheet / Certificate Document
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Choose file */}
                    <label className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm text-slate-600">
                      <Upload className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate max-w-[180px]">
                        {fileNames[level] || 'Choose file'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange(level, e)}
                      />
                    </label>

                    {/* View existing document */}
                    {docUrl && (
                      <>
                        <a
                          href={BACKEND + docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                        >
                          <Eye className="w-4 h-4" /> View
                        </a>
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg">
                          <Check className="w-3.5 h-3.5" /> Document on file
                        </span>
                      </>
                    )}
                  </div>
                  {fileNames[level] && (
                    <p className="text-xs text-slate-500 mt-1.5">
                      Selected: {fileNames[level]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => { form.reset(buildDefaults(defaultValues)); setFileNames({}); setFileMap({}); }} className="btn-secondary">
            Reset
          </button>
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-70
              ${isSaved ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-primary'}`}
          >
            {form.formState.isSubmitting ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
            ) : isSaved ? (
              <><Check className="w-3.5 h-3.5" /> Saved Successfully</>
            ) : (
              <><Save className="w-3.5 h-3.5" /> Save Qualifications</>
            )}
          </button>
        </div>
      </form>
    </Form>
  );
}
