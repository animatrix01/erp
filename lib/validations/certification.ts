import { z } from 'zod';

export const certificationSchema = z.object({
  id: z.string().optional(),
  certificationName: z.string().min(1, 'Certification name is required'),
  issuingOrganization: z.string().min(1, 'Issuing organization is required'),
  issueDate: z.coerce.date(),
  doesNotExpire: z.boolean().optional().default(false),
  expiryDate: z.coerce.date().optional().or(z.literal('')),
  certificateNumber: z.string().optional(),
  credentialUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  documentFilePath: z.string().optional(),  // Existing file path from backend
  documentFile: z.any().optional(),         // New file upload (File object)
});

export const certificationsArraySchema = z.object({
  certifications: z.array(certificationSchema),
});

export type CertificationFormData = z.infer<typeof certificationSchema>;
export type CertificationsArrayFormData = z.infer<typeof certificationsArraySchema>;
