'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  astrologyProfileSchema,
  numerologyProfileSchema,
  AstrologyProfileFormData,
  NumerologyProfileFormData,
} from '@/lib/validations/astrology-numerology';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Sparkles, Hash } from 'lucide-react';
import { AstrologyProfile, NumerologyProfile } from '@/lib/types';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const CHINESE_ZODIAC = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
];

const CHINESE_ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
const VEDIC_ELEMENTS = ['Fire', 'Earth', 'Air', 'Water', 'Ether'];

interface AstrologyNumerologyFormProps {
  astrologyData?: AstrologyProfile;
  numerologyData?: NumerologyProfile;
  onSubmit: (astrology: AstrologyProfileFormData, numerology: NumerologyProfileFormData) => void;
}

export function AstrologyNumerologyForm({
  astrologyData,
  numerologyData,
  onSubmit,
}: AstrologyNumerologyFormProps) {
  // Astrology form
  const astrologyForm = useForm<AstrologyProfileFormData>({
    resolver: zodResolver(astrologyProfileSchema),
    defaultValues: astrologyData ?? {
      birthTime: '',
      birthPlace: '',
      zodiacSign: '',
      moonSign: '',
      ascendant: '',
      nakshatra: '',
      gotra: '',
      pada: '',
      chineseZodiac: '',
      chineseElement: '',
      vedicElement: '',
    },
    mode: 'onBlur',
  });

  // Numerology form
  const numerologyForm = useForm<NumerologyProfileFormData>({
    resolver: zodResolver(numerologyProfileSchema),
    defaultValues: numerologyData ?? {
      lifePathNumber: '' as any,
      destinyNumber: '' as any,
      soulUrgeNumber: '' as any,
      personalityNumber: '' as any,
      birthdayNumber: '' as any,
      kuaNumber: '' as any,
      luckyNumbers: '',
      luckyColours: '',
      luckyGemstone: '',
      favourableDays: '',
      notes: '',
    },
    mode: 'onBlur',
  });

  // ── Re-populate both forms when async data arrives from the parent ────────
  useEffect(() => {
    if (astrologyData) {
      astrologyForm.reset({
        birthTime:      astrologyData.birthTime      ?? '',
        birthPlace:     astrologyData.birthPlace     ?? '',
        zodiacSign:     astrologyData.zodiacSign     ?? '',
        moonSign:       astrologyData.moonSign       ?? '',
        ascendant:      astrologyData.ascendant      ?? '',
        nakshatra:      astrologyData.nakshatra      ?? '',
        gotra:          astrologyData.gotra          ?? '',
        pada:           astrologyData.pada           ?? '',
        chineseZodiac:  astrologyData.chineseZodiac  ?? '',
        chineseElement: astrologyData.chineseElement ?? '',
        vedicElement:   astrologyData.vedicElement   ?? '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [astrologyData]);

  useEffect(() => {
    if (numerologyData) {
      numerologyForm.reset({
        lifePathNumber:    numerologyData.lifePathNumber    ?? ('' as any),
        destinyNumber:     numerologyData.destinyNumber     ?? ('' as any),
        soulUrgeNumber:    numerologyData.soulUrgeNumber    ?? ('' as any),
        personalityNumber: numerologyData.personalityNumber ?? ('' as any),
        birthdayNumber:    numerologyData.birthdayNumber    ?? ('' as any),
        kuaNumber:         numerologyData.kuaNumber         ?? ('' as any),
        luckyNumbers:      numerologyData.luckyNumbers      ?? '',
        luckyColours:      numerologyData.luckyColours      ?? '',
        luckyGemstone:     numerologyData.luckyGemstone     ?? '',
        favourableDays:    numerologyData.favourableDays    ?? '',
        notes:             numerologyData.notes             ?? '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numerologyData]);

  const handleSave = async () => {
    const [astroValid, numValid] = await Promise.all([
      astrologyForm.trigger(),
      numerologyForm.trigger(),
    ]);
    if (!astroValid || !numValid) return;
    
    const astroData = astrologyForm.getValues();
    const numData = numerologyForm.getValues();
    
    // Convert empty strings to undefined for numeric fields
    const cleanedNumData = {
      ...numData,
      lifePathNumber: numData.lifePathNumber === '' ? undefined : numData.lifePathNumber,
      destinyNumber: numData.destinyNumber === '' ? undefined : numData.destinyNumber,
      soulUrgeNumber: numData.soulUrgeNumber === '' ? undefined : numData.soulUrgeNumber,
      personalityNumber: numData.personalityNumber === '' ? undefined : numData.personalityNumber,
      birthdayNumber: numData.birthdayNumber === '' ? undefined : numData.birthdayNumber,
      kuaNumber: numData.kuaNumber === '' ? undefined : numData.kuaNumber,
    };
    
    onSubmit(astroData, cleanedNumData);
  };

  return (
    <div className="space-y-6">
      {/* ── Astrology Profile ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-0.5 bg-purple-600" />
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Astrology Profile</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Vedic, Western & Chinese astrological information
            </p>
          </div>
        </div>
        <Form {...astrologyForm}>
          <div className="p-5 space-y-4">
            {/* Birth Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={astrologyForm.control}
                name="birthTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="field-label">Birth Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        placeholder="HH:MM"
                        className="field-input"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={astrologyForm.control}
                name="birthPlace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="field-label">Birth Place</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City, State, Country"
                        className="field-input"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Western Astrology */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Western Astrology
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={astrologyForm.control}
                  name="zodiacSign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Zodiac Sign (Sun Sign)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger className="field-input">
                            <SelectValue placeholder="Select sign" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ZODIAC_SIGNS.map((sign) => (
                            <SelectItem key={sign} value={sign}>
                              {sign}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={astrologyForm.control}
                  name="moonSign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Moon Sign</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger className="field-input">
                            <SelectValue placeholder="Select sign" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ZODIAC_SIGNS.map((sign) => (
                            <SelectItem key={sign} value={sign}>
                              {sign}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={astrologyForm.control}
                  name="ascendant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Ascendant (Lagna)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger className="field-input">
                            <SelectValue placeholder="Select sign" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ZODIAC_SIGNS.map((sign) => (
                            <SelectItem key={sign} value={sign}>
                              {sign}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Vedic Astrology */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Vedic Astrology
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={astrologyForm.control}
                  name="nakshatra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Nakshatra (Birth Star)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger className="field-input">
                            <SelectValue placeholder="Select nakshatra" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NAKSHATRAS.map((nak) => (
                            <SelectItem key={nak} value={nak}>
                              {nak}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={astrologyForm.control}
                  name="pada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Pada (Quarter)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger className="field-input">
                            <SelectValue placeholder="Select pada" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Pada 1</SelectItem>
                          <SelectItem value="2">Pada 2</SelectItem>
                          <SelectItem value="3">Pada 3</SelectItem>
                          <SelectItem value="4">Pada 4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={astrologyForm.control}
                  name="gotra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Gotra</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter gotra"
                          className="field-input"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={astrologyForm.control}
                  name="vedicElement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Vedic Element (Tattva)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger className="field-input">
                            <SelectValue placeholder="Select element" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VEDIC_ELEMENTS.map((elem) => (
                            <SelectItem key={elem} value={elem}>
                              {elem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Chinese Astrology */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Chinese Astrology
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={astrologyForm.control}
                  name="chineseZodiac"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Chinese Zodiac</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger className="field-input">
                            <SelectValue placeholder="Select zodiac" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CHINESE_ZODIAC.map((animal) => (
                            <SelectItem key={animal} value={animal}>
                              {animal}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={astrologyForm.control}
                  name="chineseElement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Chinese Element</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger className="field-input">
                            <SelectValue placeholder="Select element" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CHINESE_ELEMENTS.map((elem) => (
                            <SelectItem key={elem} value={elem}>
                              {elem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </Form>
      </div>

      {/* ── Numerology Profile ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-0.5 bg-indigo-600" />
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Hash className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Numerology Profile</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Life path, destiny & lucky numbers
            </p>
          </div>
        </div>
        <Form {...numerologyForm}>
          <div className="p-5 space-y-4">
            {/* Core Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'lifePathNumber' as const, label: 'Life Path Number', max: 99 },
                { name: 'destinyNumber' as const, label: 'Destiny Number', max: 99 },
                { name: 'soulUrgeNumber' as const, label: 'Soul Urge Number', max: 99 },
                { name: 'personalityNumber' as const, label: 'Personality Number', max: 99 },
                { name: 'birthdayNumber' as const, label: 'Birthday Number', max: 31 },
                { name: 'kuaNumber' as const, label: 'Kua Number', max: 9 },
              ].map((field) => (
                <FormField
                  key={field.name}
                  control={numerologyForm.control}
                  name={field.name}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="field-label">{field.label}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max={field.max}
                          placeholder="0"
                          className="field-input"
                          {...f}
                          value={f.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Lucky Elements */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Lucky Elements
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={numerologyForm.control}
                  name="luckyNumbers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Lucky Numbers</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="3, 7, 9, 21"
                          className="field-input"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={numerologyForm.control}
                  name="luckyColours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Lucky Colours</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Blue, Green, White"
                          className="field-input"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={numerologyForm.control}
                  name="luckyGemstone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Lucky Gemstone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ruby, Emerald, Sapphire"
                          className="field-input"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={numerologyForm.control}
                  name="favourableDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="field-label">Favourable Days</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Monday, Wednesday, Friday"
                          className="field-input"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="pt-3 border-t border-slate-100">
              <FormField
                control={numerologyForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="field-label">Additional Notes</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Additional numerology insights or interpretations..."
                        className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            astrologyForm.reset();
            numerologyForm.reset();
          }}
          className="btn-secondary"
        >
          Reset
        </button>
        <button type="button" onClick={handleSave} className="btn-primary">
          <Save className="w-3.5 h-3.5" /> Save Astrology &amp; Numerology
        </button>
      </div>
    </div>
  );
}
