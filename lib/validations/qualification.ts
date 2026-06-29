import { z } from 'zod';

export const QUALIFICATION_LEVELS = ['10th', '12th', 'UG', 'PG', 'PhD'] as const;
export type QualificationLevel = (typeof QUALIFICATION_LEVELS)[number];

// Schema for a single tier card — all fields optional so blank cards are fine
export const tierSchema = z.object({
  level: z.enum(QUALIFICATION_LEVELS),
  degreeName:      z.string().optional(),
  specialization:  z.string().optional(),
  institution:     z.string().optional(),
  boardUniversity: z.string().optional(),
  passingYear: z.coerce.number()
    .int()
    .min(1950, 'Year must be 1950 or later')
    .max(new Date().getFullYear() + 5, 'Invalid year')
    .optional()
    .or(z.literal('' as unknown as number)),
  scoreType:   z.enum(['percentage', 'cgpa', 'grade', 'awarded', 'other']).optional(),
  scoreValue:  z.string().optional(),
  percentage:  z.coerce.number().min(0).max(100).optional().or(z.literal('' as unknown as number)),
  studyMode:   z.string().optional(),
  // Ph.D. specific
  thesisTitle:   z.string().optional(),
  researchGuide: z.string().optional(),
  researchArea:  z.string().optional(),
  vivaDate:      z.string().optional(),
  // Document
  documentUrl:  z.string().optional(),   // from backend (existing)
  documentFile: z.any().optional(),      // File object (new upload)
});

// The full form is a record keyed by level
export const qualificationsFormSchema = z.object({
  '10th': tierSchema,
  '12th': tierSchema,
  'UG':   tierSchema,
  'PG':   tierSchema,
  'PhD':  tierSchema,
});

export type TierFormData            = z.infer<typeof tierSchema>;
export type QualificationsFormData  = z.infer<typeof qualificationsFormSchema>;

// ── Legacy array schema — kept so qualifications-table.tsx still compiles ────
export const qualificationSchema = tierSchema;
export const qualificationsArraySchema = z.object({
  qualifications: z.array(tierSchema),
});
export type QualificationFormData       = TierFormData;
export type QualificationsArrayFormData = { qualifications: TierFormData[] };
