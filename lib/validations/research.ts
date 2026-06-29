import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const publicationSchema = z.object({
  id: z.string().optional(),
  publicationType: z.enum(['journal', 'conference', 'book', 'book_chapter', 'other']).optional(),
  journalTitle: z.string().min(1, 'Title / name is required'),
  authors: z.string().optional(),
  publisherVenue: z.string().optional(),
  conferenceDetails: z.string().optional(),
  doi: z.string().optional().or(z.literal('')),
  impactFactor: z.coerce.number().positive('Must be positive').optional().or(z.literal('')),
  publicationYear: z.coerce.number()
    .int('Year must be a whole number')
    .min(1950, 'Year must be after 1950')
    .max(currentYear + 1, 'Invalid year')
    .optional()
    .or(z.literal('')),
  volumeIssuePages: z.string().optional(),
  citationCount: z.coerce.number()
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .optional()
    .or(z.literal('')),
});

export const publicationsArraySchema = z.object({
  publications: z.array(publicationSchema),
});

// Research Profile (IDs / URLs)
export const researchProfileSchema = z.object({
  orcid:             z.string().optional().or(z.literal('')),
  scopusId:          z.string().optional().or(z.literal('')),
  googleScholarUrl:  z.string().url('Enter a valid URL').optional().or(z.literal('')),
  researchgateUrl:   z.string().url('Enter a valid URL').optional().or(z.literal('')),
  linkedinUrl:       z.string().url('Enter a valid URL').optional().or(z.literal('')),
  personalWebsite:   z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

export type PublicationFormData     = z.infer<typeof publicationSchema>;
export type PublicationsArrayFormData = z.infer<typeof publicationsArraySchema>;
export type ResearchProfileFormData = z.infer<typeof researchProfileSchema>;
