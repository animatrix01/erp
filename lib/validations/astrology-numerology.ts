import { z } from 'zod';

// Astrology Profile Schema
export const astrologyProfileSchema = z.object({
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  zodiacSign: z.string().optional(),
  moonSign: z.string().optional(),
  ascendant: z.string().optional(),
  nakshatra: z.string().optional(),
  gotra: z.string().optional(),
  pada: z.string().optional(),
  chineseZodiac: z.string().optional(),
  chineseElement: z.string().optional(),
  vedicElement: z.string().optional(),
});

export type AstrologyProfileFormData = z.infer<typeof astrologyProfileSchema>;

// Numerology Profile Schema
export const numerologyProfileSchema = z.object({
  lifePathNumber: z.coerce.number().int().min(1).max(99).optional().or(z.literal('')),
  destinyNumber: z.coerce.number().int().min(1).max(99).optional().or(z.literal('')),
  soulUrgeNumber: z.coerce.number().int().min(1).max(99).optional().or(z.literal('')),
  personalityNumber: z.coerce.number().int().min(1).max(99).optional().or(z.literal('')),
  birthdayNumber: z.coerce.number().int().min(1).max(31).optional().or(z.literal('')),
  kuaNumber: z.coerce.number().int().min(1).max(9).optional().or(z.literal('')),
  luckyNumbers: z.string().optional(),
  luckyColours: z.string().optional(),
  luckyGemstone: z.string().optional(),
  favourableDays: z.string().optional(),
  notes: z.string().optional(),
});

export type NumerologyProfileFormData = z.infer<typeof numerologyProfileSchema>;
