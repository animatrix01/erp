'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '@/lib/validations/contact';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Phone, Save, Check, Loader2 } from 'lucide-react';

interface ContactFormProps {
  defaultValues?: Partial<ContactFormData>;
  onSubmit: (data: ContactFormData) => void;
}

export function ContactForm({ defaultValues, onSubmit }: ContactFormProps) {
  const [isSaved, setIsSaved] = useState(false);
  const timerRef = useState<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: defaultValues || {
      alternatePhone:  '',
      personalEmail:   '',
      officeExtension: '',
      fax:             '',
    },
    mode: 'onBlur',
  });

  const handleSubmit = async (data: ContactFormData) => {
    await onSubmit(data);
    setIsSaved(true);
    if (timerRef[0]) clearTimeout(timerRef[0]);
    timerRef[0] = setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Contact Information</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Alternate contact numbers, personal email and office details
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              { name: 'alternatePhone'  as const, label: 'Mobile (Alternate)', placeholder: '+919876543210' },
              { name: 'personalEmail'   as const, label: 'Personal Email',     placeholder: 'name@gmail.com', type: 'email' },
              { name: 'officeExtension' as const, label: 'Office Extension',   placeholder: 'Ext. 2341' },
              { name: 'fax'             as const, label: 'Fax',                placeholder: 'N/A' },
            ]).map((f) => (
              <FormField
                key={f.name}
                control={form.control}
                name={f.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="field-label">{f.label}</FormLabel>
                    <FormControl>
                      <Input
                        type={('type' in f ? f.type : undefined) || 'text'}
                        placeholder={f.placeholder}
                        className="field-input"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button type="button" onClick={() => form.reset()} className="btn-secondary">
              Reset
            </button>
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-70
                ${isSaved
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'btn-primary'
                }`}
            >
              {form.formState.isSubmitting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
              ) : isSaved ? (
                <><Check className="w-3.5 h-3.5" /> Saved Successfully</>
              ) : (
                <><Phone className="w-3.5 h-3.5" /> Save Contact</>
              )}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
