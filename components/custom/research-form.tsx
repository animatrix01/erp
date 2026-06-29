'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  publicationsArraySchema, researchProfileSchema,
  PublicationsArrayFormData, ResearchProfileFormData,
} from '@/lib/validations/research';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, BookOpen, Save, Link as LinkIcon } from 'lucide-react';
import { Publication, ResearchProfile } from '@/lib/types';

const PUB_TYPES = [
  { value: 'journal',       label: 'Journal Article'   },
  { value: 'conference',    label: 'Conference Paper'   },
  { value: 'book',          label: 'Book'               },
  { value: 'book_chapter',  label: 'Book Chapter'       },
  { value: 'other',         label: 'Other'              },
];

const blankPub = (): Publication => ({
  id: Date.now().toString(),
  publicationType: 'journal',
  journalTitle: '', authors: '', publisherVenue: '',
  conferenceDetails: '', doi: '',
  impactFactor: undefined, publicationYear: undefined,
  volumeIssuePages: '', citationCount: undefined,
});

interface ResearchFormProps {
  defaultValues?: Publication[];
  researchProfile?: ResearchProfile;
  onSubmit: (pubs: Publication[], profile?: ResearchProfile) => void;
}

export function ResearchForm({ defaultValues = [], researchProfile, onSubmit }: ResearchFormProps) {
  // Publications form
  const pubForm = useForm<PublicationsArrayFormData>({
    resolver: zodResolver(publicationsArraySchema),
    defaultValues: { publications: defaultValues.length > 0 ? defaultValues : [blankPub()] },
    mode: 'onBlur',
  });
  const { fields, append, remove } = useFieldArray({ control: pubForm.control, name: 'publications' });

  // Research profile form
  const profileForm = useForm<ResearchProfileFormData>({
    resolver: zodResolver(researchProfileSchema),
    defaultValues: researchProfile ?? {
      orcid: '', scopusId: '', googleScholarUrl: '',
      researchgateUrl: '', linkedinUrl: '', personalWebsite: '',
    },
    mode: 'onBlur',
  });

  const handleSave = async () => {
    const [pubValid, profileValid] = await Promise.all([
      pubForm.trigger(),
      profileForm.trigger(),
    ]);
    if (!pubValid || !profileValid) return;
    const pubData = pubForm.getValues();
    const profileData = profileForm.getValues();
    onSubmit(
      pubData.publications.map(p => ({
        ...p,
        impactFactor:    p.impactFactor    === '' ? undefined : p.impactFactor    as number | undefined,
        publicationYear: p.publicationYear === '' ? undefined : p.publicationYear as number | undefined,
        citationCount:   p.citationCount   === '' ? undefined : p.citationCount   as number | undefined,
      })),
      profileData
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Research Profile IDs ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-0.5 bg-violet-600" />
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <LinkIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Research Profile & IDs</h3>
            <p className="text-xs text-slate-400 mt-0.5">ORCID, Scopus, Google Scholar, ResearchGate & social links</p>
          </div>
        </div>
        <Form {...profileForm}>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'orcid'            as const, label: 'ORCID iD',           placeholder: '0000-0002-1825-0097' },
              { name: 'scopusId'         as const, label: 'Scopus Author ID',    placeholder: '57210991452' },
              { name: 'googleScholarUrl' as const, label: 'Google Scholar URL',  placeholder: 'https://scholar.google.com/citations?user=...' },
              { name: 'researchgateUrl'  as const, label: 'ResearchGate URL',    placeholder: 'https://www.researchgate.net/profile/...' },
              { name: 'linkedinUrl'      as const, label: 'LinkedIn URL',        placeholder: 'https://www.linkedin.com/in/...' },
              { name: 'personalWebsite'  as const, label: 'Personal Website',    placeholder: 'https://yourname.edu/' },
            ].map(f => (
              <FormField key={f.name} control={profileForm.control} name={f.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="field-label">{f.label}</FormLabel>
                    <FormControl>
                      <Input placeholder={f.placeholder} className="field-input" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
            ))}
          </div>
        </Form>
      </div>

      {/* ── Publications List ────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Publications</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {fields.length} publication{fields.length !== 1 ? 's' : ''} on file
            </p>
          </div>
          <button type="button" onClick={() => append(blankPub())}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Publication
          </button>
        </div>
      </div>

      <Form {...pubForm}>
        <div className="space-y-4">
          {fields.map((field, index) => {
            const pubTypeVal = pubForm.watch(`publications.${index}.publicationType`);
            const isConference = pubTypeVal === 'conference';

            return (
              <div key={field.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-0.5 bg-blue-600" />
                <div className="p-5">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {pubForm.watch(`publications.${index}.journalTitle`) || `Publication ${index + 1}`}
                      </span>
                      {pubTypeVal && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full capitalize">
                          {pubTypeVal.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <button type="button" onClick={() => remove(index)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>

                  {/* ── Row 1: Type + Title ── */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField control={pubForm.control} name={`publications.${index}.publicationType`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Publication Type</FormLabel>
                          <Select onValueChange={f.onChange} value={f.value ?? 'journal'}>
                            <FormControl>
                              <SelectTrigger className="field-input">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PUB_TYPES.map(t => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={pubForm.control} name={`publications.${index}.journalTitle`}
                      render={({ field: f }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="field-label">
                            {isConference ? 'Paper Title *' : 'Journal / Book Title *'}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Full title of the work" className="field-input" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>

                  {/* ── Row 2: Authors + Publisher/Venue ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField control={pubForm.control} name={`publications.${index}.authors`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Authors</FormLabel>
                          <FormControl>
                            <Input placeholder="Surname A, Surname B, et al." className="field-input" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={pubForm.control} name={`publications.${index}.publisherVenue`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">
                            {isConference ? 'Conference Venue / Name' : 'Publisher'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={isConference ? 'IEEE, ACM, Springer…' : 'Elsevier, Springer…'}
                              className="field-input" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>

                  {/* ── Row 3: Conference details (conditional) ── */}
                  {isConference && (
                    <div className="mb-4">
                      <FormField control={pubForm.control} name={`publications.${index}.conferenceDetails`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="field-label">Conference Details</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. CVPR 2023, Vancouver, Canada" className="field-input" {...f} value={f.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                    </div>
                  )}

                  {/* ── Row 4: DOI + IF + Year + Vol/Issue + Citations ── */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField control={pubForm.control} name={`publications.${index}.doi`}
                      render={({ field: f }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel className="field-label">DOI</FormLabel>
                          <FormControl>
                            <Input placeholder="https://doi.org/10.xxxx/..." className="field-input" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={pubForm.control} name={`publications.${index}.impactFactor`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Impact Factor</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="5.2" className="field-input" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={pubForm.control} name={`publications.${index}.publicationYear`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Year</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2024" className="field-input" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={pubForm.control} name={`publications.${index}.volumeIssuePages`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Vol / Issue / Pages</FormLabel>
                          <FormControl>
                            <Input placeholder="12(3):45-60" className="field-input" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                    <FormField control={pubForm.control} name={`publications.${index}.citationCount`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="field-label">Citations</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="150" className="field-input" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Form>

      {/* Save button */}
      <div className="flex items-center justify-between">
        <button type="button"
          onClick={() => { pubForm.reset(); profileForm.reset(); }}
          className="btn-secondary">
          Reset
        </button>
        <button type="button" onClick={handleSave} className="btn-primary">
          <Save className="w-3.5 h-3.5" /> Save Publications &amp; Profile
        </button>
      </div>
    </div>
  );
}
