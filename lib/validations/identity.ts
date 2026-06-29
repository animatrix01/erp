import { z } from 'zod';

export const identitySchema = z.object({
  aadharNumber: z.string()
    .regex(/^\d{12}$/, 'Aadhar must be 12 digits')
    .optional()
    .or(z.literal('')),
  panNumber: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., ABCDE1234F)')
    .optional()
    .or(z.literal('')),
  passportNumber: z.string().optional(),
  passportExpiryDate: z.coerce.date().optional().or(z.literal('')),
  drivingLicenseNumber: z.string().optional(),
  voterId: z.string().optional(),
  // File uploads (optional, can be File or null)
  aadharFile: z.any().optional(),
  panFile: z.any().optional(),
  passportFile: z.any().optional(),
  voterIdFile: z.any().optional(),
  drivingLicenseFile: z.any().optional(),
  // Existing file paths (from backend)
  aadharFilePath: z.string().optional(),
  panFilePath: z.string().optional(),
  passportFilePath: z.string().optional(),
  voterIdFilePath: z.string().optional(),
  drivingLicenseFilePath: z.string().optional(),
  // Status fields
  aadharStatus: z.enum(['missing', 'pending', 'verified']).optional(),
  panStatus: z.enum(['missing', 'pending', 'verified']).optional(),
  passportStatus: z.enum(['missing', 'pending', 'verified']).optional(),
  voterIdStatus: z.enum(['missing', 'pending', 'verified']).optional(),
  drivingLicenseStatus: z.enum(['missing', 'pending', 'verified']).optional(),
});

export type IdentityFormData = z.infer<typeof identitySchema>;
