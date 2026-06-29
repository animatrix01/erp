import { z } from 'zod';

export const addressSchema = z.object({
  id: z.string().optional(),
  addressType: z.enum(['permanent', 'current', 'correspondence']),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  district: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string()
    .min(6, 'Postal code must be 6 digits')
    .max(6, 'Postal code must be 6 digits')
    .regex(/^\d{6}$/, 'Postal code must be 6 digits'),
  country: z.string().default('India'),
});

export const addressArraySchema = z.object({
  addresses: z.array(addressSchema),
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type AddressArrayFormData = z.infer<typeof addressArraySchema>;
