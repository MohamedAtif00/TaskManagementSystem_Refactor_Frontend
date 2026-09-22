/** Canonical subject labels — keep in sync with BuildingBlocks LoCodeCatalog.cs */
export const LO_CODE_SUBJECTS: Record<string, { en: string; ar: string }> = {
  mth: { en: 'Math', ar: 'الرياضيات' },
  ara: { en: 'Arabic', ar: 'اللغة العربية' },
  sci: { en: 'Science', ar: 'العلوم' },
  eng: { en: 'English', ar: 'اللغة الإنجليزية' },
  soc: { en: 'Social Studies', ar: 'الدراسات الاجتماعية' },
  mul: { en: 'Multimedia', ar: 'الوسائط المتعددة' },
  rel: { en: 'Religion', ar: 'التربية الدينية' },
  ict: { en: 'ICT', ar: 'الحاسب' },
  tsk: { en: 'Tokkatsu', ar: 'التوكاتسو' },
};

/** Sample codes covering every catalog subject, plus year / QR_ / _p2 variants. */
export const LO_CODE_SEED_SAMPLES = [
  'Mth_5R_1A_01_04_02',
  'Ara_5R_1A_01_01_04',
  'Sci_5R_1A_04_03_05',
  'Eng_5R_1E_07_04_04',
  'Soc_5R_1A_02_03_02',
  'Mul_2R_1E_01_03_01',
  'Rel_3R_1A_05_02_01',
  'Ict_5R_1A_01_02_01',
  'Tsk_1R_1A_01_01_01',
  '2026_ara_2r_1a_02_05_03',
  '2026_eng_4r_1e_02_02_03',
  'QR_mth_1r_1a_02_02_06',
  'QR_2025_ara_3r_1a_01_01_01',
  'Soc_4R_1A_01_04_03_p2',
] as const;
