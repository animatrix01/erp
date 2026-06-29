import { z } from 'zod';

export const profileSchema = z.object({
  // Relaxed: allow lowercase, dots, hyphens, 3-20 chars so EMP001 and emp-001 both work
  employeeId: z.string().min(1, 'Employee ID is required'),

  firstName:   z.string().min(1, 'First name is required'),
  middleName:  z.string().optional(),
  lastName:    z.string().min(1, 'Last name is required'),
  displayName: z.string().optional(),

  email: z.string().email('Invalid email format'),

  // Relaxed: allow 7-15 digits, optional leading +, handles Indian mobile & landlines
  phone: z.string()
    .min(7, 'Phone number must be at least 7 digits')
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number format'),

  dateOfBirth: z.coerce.date({
    errorMap: () => ({ message: 'Date of birth is required' }),
  }),

  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),

  // All optional — the form labels do NOT show * for these
  maritalStatus:  z.string().optional().nullable(),
  nationality:    z.string().optional().nullable(),
  religion:       z.string().optional().nullable(),
  category:       z.string().optional().nullable(),

  // Blood group is required by the UI label (*)
  bloodGroup: z.string().min(1, 'Blood group is required'),

  languagesKnown: z.string().optional().nullable(),

  // Job / institutional fields
  role:          z.string().optional().nullable(),
  designation:   z.string().optional().nullable(),
  department:    z.string().optional().nullable(),
  dateOfJoining: z.string().optional().nullable(),   // stored as YYYY-MM-DD string
});

export type ProfileFormData = z.infer<typeof profileSchema>;
