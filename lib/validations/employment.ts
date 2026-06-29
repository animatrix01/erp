import { z } from 'zod';

export const employmentSchema = z.object({
  id: z.string().optional(),
  organizationName: z.string().min(1, 'Organization is required'),
  designation: z.string().min(1, 'Designation is required'),
  department: z.string().optional(),
  employmentType: z.string().optional(),
  fromDate: z.coerce.date(),
  toDate: z.coerce.date().nullable().optional(),
  isCurrent: z.boolean().optional().default(false),
  totalExperienceYears: z.number().optional(),
}).refine(
  (data) => {
    if (data.isCurrent) return true;          // no end date required if current
    if (!data.toDate) return false;           // toDate required if not current
    return data.toDate > data.fromDate;
  },
  {
    message: 'To date must be after from date (or check "Currently Working Here")',
    path: ['toDate'],
  }
);

export const employmentArraySchema = z.object({
  employmentHistory: z.array(employmentSchema),
});

export type EmploymentFormData = z.infer<typeof employmentSchema>;
export type EmploymentArrayFormData = z.infer<typeof employmentArraySchema>;
