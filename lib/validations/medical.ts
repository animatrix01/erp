import { z } from 'zod';

export const emergencyContactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(1, 'Phone is required')
    .refine((val) => /^\+?[1-9]\d{9,14}$/.test(val), {
      message: 'Invalid phone number format'
    }),
  alternatePhone: z.string().optional(),
  email: z.string().optional()
    .refine((val) => !val || val === '' || z.string().email().safeParse(val).success, {
      message: 'Invalid email format'
    }),
  address: z.string().optional(),
  priority: z.coerce.number().int().positive().optional().or(z.literal('')),
  bloodGroup: z.string().optional(),
  contactType: z.enum(['general', 'medical']).optional(),
});

export const dependentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  dateOfBirth: z.coerce.date(),
  gender: z.string().optional(),
  isDependent: z.boolean().optional(),
  aadharNumber: z.string().optional(),
  occupation: z.string().optional(),
  contactNumber: z.string().optional(),
});

export const medicalSchema = z.object({
  emergencyContacts: z.array(emergencyContactSchema),
  allergies: z.array(z.string()),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  dependents: z.array(dependentSchema),
  medicalHistory: z.string().optional(),
  height: z.coerce.number().positive('Height must be positive').optional().or(z.literal('')),
  weight: z.coerce.number().positive('Weight must be positive').optional().or(z.literal('')),
  lastMedicalCheckup: z.string().optional().or(z.literal('')),
  disability: z.string().optional().or(z.literal('')),
  physicallyHandicapped: z.boolean().optional().default(false),
  knownAllergies: z.string().optional().or(z.literal('')),
  medicalNotes: z.string().optional().or(z.literal('')),
  insurancePolicyNumber: z.string().optional(),
  insuranceProvider: z.string().optional(),
});

export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;
export type DependentFormData = z.infer<typeof dependentSchema>;
export type MedicalFormData = z.infer<typeof medicalSchema>;
