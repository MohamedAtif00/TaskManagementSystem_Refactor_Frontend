import {
  gradeLabel,
  lessonLabel,
  subjectName,
  termLabel,
  tryParseLoCode,
  unitLabel,
  type LoCodeLanguage,
} from './lo-code.catalog';
import { LO_CODE_SEED_SAMPLES, LO_CODE_SUBJECTS } from './lo-code.subjects';

export { LO_CODE_SEED_SAMPLES } from './lo-code.subjects';

export interface LoCodeSeedRow {
  code: string;
  subjectCode: string;
  subjectGroup: string;
  subject: string;
  termName: string;
  unitName: string;
  lessonName: string;
}

export function buildLoCodeSeedRow(code: string, language: LoCodeLanguage = 'en'): LoCodeSeedRow {
  const parsed = tryParseLoCode(code);
  if (!parsed) {
    throw new Error(`Invalid LO seed code: ${code}`);
  }

  const subjectGroup = subjectName(parsed.subjectCode, language);
  return {
    code,
    subjectCode: parsed.subjectCode,
    subjectGroup,
    subject: `${subjectGroup} ${gradeLabel(parsed.grade, language)}`,
    termName: termLabel(parsed.termNumber, parsed.track, language),
    unitName: unitLabel(parsed.unit, language),
    lessonName: lessonLabel(parsed.lesson, language),
  };
}

export function loCodeSeedRows(language: LoCodeLanguage = 'en'): LoCodeSeedRow[] {
  return LO_CODE_SEED_SAMPLES.map((code) => buildLoCodeSeedRow(code, language));
}

export function catalogSubjectCodes(): string[] {
  return Object.keys(LO_CODE_SUBJECTS);
}
