export type LoCodeLanguage = 'en' | 'ar';

export interface LoCode {
  prefix: string | null;
  year: number | null;
  subjectCode: string;
  grade: number;
  termNumber: number;
  track: 'A' | 'E';
  unit: number;
  lesson: number;
  loIndex: number;
  suffix: string | null;
}

const SUBJECTS: Record<string, { en: string; ar: string }> = {
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

export function subjectName(subjectCode: string, language: LoCodeLanguage): string {
  return SUBJECTS[subjectCode.toLowerCase()]?.[language] ?? subjectCode;
}

export function gradeLabel(grade: number, language: LoCodeLanguage): string {
  return language === 'ar' ? `الصف ${grade}` : `Grade ${grade}`;
}

export function trackLabel(track: string, language: LoCodeLanguage): string {
  const isEnglishTrack = track.toUpperCase() === 'E';
  if (language === 'ar') {
    return isEnglishTrack ? 'إنجليزي' : 'عربي';
  }
  return isEnglishTrack ? 'English' : 'Arabic';
}

export function termLabel(termNumber: number, track: string, language: LoCodeLanguage): string {
  const trackText = trackLabel(track, language);
  if (language === 'ar') {
    const term = termNumber === 2 ? 'الفصل الدراسي الثاني' : 'الفصل الدراسي الأول';
    return `${term} (${trackText})`;
  }
  return `Term ${termNumber} (${trackText})`;
}

export function unitLabel(unit: number, language: LoCodeLanguage): string {
  return language === 'ar' ? `الوحدة ${unit}` : `Unit ${unit}`;
}

export function lessonLabel(lesson: number, language: LoCodeLanguage): string {
  return language === 'ar' ? `الدرس ${lesson}` : `Lesson ${lesson}`;
}

export function loIndexLabel(loIndex: number, language: LoCodeLanguage): string {
  return language === 'ar' ? `الهدف ${loIndex}` : `LO ${loIndex}`;
}

export function suffixLabel(suffix: string | null, language: LoCodeLanguage): string | null {
  if (!suffix) {
    return null;
  }

  const partMatch = /^p(\d+)$/i.exec(suffix);
  if (partMatch) {
    const part = partMatch[1];
    return language === 'ar' ? `الجزء ${part}` : `Part ${part}`;
  }

  return suffix;
}

const LO_CODE_PATTERN =
  /^(?:(?<prefix>QR)_)?(?:(?<year>\d{4})_)?(?<subject>[A-Za-z]{3})_(?<grade>\d{1,2})[Rr]_(?<termNumber>[12])(?<track>[AEae])_(?<unit>\d{2})_(?<lesson>\d{2})_(?<lo>\d{2})(?:_(?<suffix>.+))?$/i;

export function tryParseLoCode(raw: string | null | undefined): LoCode | null {
  if (!raw?.trim()) {
    return null;
  }

  const match = LO_CODE_PATTERN.exec(raw.trim());
  if (!match?.groups) {
    return null;
  }

  const { prefix, year, subject, grade, termNumber, track, unit, lesson, lo, suffix } = match.groups;
  if (!subject || !grade || !termNumber || !track || !unit || !lesson || !lo) {
    return null;
  }

  return {
    prefix: prefix ? prefix.toUpperCase() : null,
    year: year ? Number(year) : null,
    subjectCode: subject.toLowerCase(),
    grade: Number(grade),
    termNumber: Number(termNumber),
    track: track.toUpperCase() as 'A' | 'E',
    unit: Number(unit),
    lesson: Number(lesson),
    loIndex: Number(lo),
    suffix: suffix ?? null,
  };
}

const SEPARATOR = ' · ';

export function formatLoCode(
  raw: string | null | undefined,
  language: LoCodeLanguage = 'en',
): string {
  const parsed = tryParseLoCode(raw);
  if (!parsed) {
    return raw ?? '';
  }

  return formatParsedLoCode(parsed, language);
}

export function formatParsedLoCode(code: LoCode, language: LoCodeLanguage = 'en'): string {
  const parts: string[] = [];
  if (code.prefix) {
    parts.push(code.prefix);
  }
  if (code.year != null) {
    parts.push(String(code.year));
  }

  parts.push(subjectName(code.subjectCode, language));
  parts.push(gradeLabel(code.grade, language));
  parts.push(termLabel(code.termNumber, code.track, language));
  parts.push(unitLabel(code.unit, language));
  parts.push(lessonLabel(code.lesson, language));
  parts.push(loIndexLabel(code.loIndex, language));

  const suffix = suffixLabel(code.suffix, language);
  if (suffix) {
    parts.push(suffix);
  }

  return parts.join(SEPARATOR);
}

