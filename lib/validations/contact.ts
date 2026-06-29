import { z } from 'zod';

export const contactSchema = z.object({
  alternatePhone: z.string()
    .regex(/^$|^\+?[1-9]\d{9,14}$/, 'Invalid phone number format')
    .optional(),
  personalEmail: z.string()
    .regex(/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format')
    .optional(),
  officeExtension: z.string().optional(),
  fax: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
