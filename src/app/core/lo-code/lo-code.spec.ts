import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatLoCode, gradeLabel, lessonLabel, subjectName, termLabel, tryParseLoCode, unitLabel } from './lo-code.catalog.ts';
import { LO_CODE_SEED_SAMPLES, LO_CODE_SUBJECTS } from './lo-code.subjects.ts';

describe('lo-code parser', () => {
  const samples: Array<{
    raw: string;
    subject: string;
    grade: number;
    term: number;
    track: 'A' | 'E';
    unit: number;
    lesson: number;
    loIndex: number;
  }> = [
    { raw: 'Mth_5R_1A_01_04_02', subject: 'mth', grade: 5, term: 1, track: 'A', unit: 1, lesson: 4, loIndex: 2 },
    { raw: 'Ara_5R_1A_01_01_04', subject: 'ara', grade: 5, term: 1, track: 'A', unit: 1, lesson: 1, loIndex: 4 },
    { raw: 'Sci_5R_1A_04_03_05', subject: 'sci', grade: 5, term: 1, track: 'A', unit: 4, lesson: 3, loIndex: 5 },
    { raw: 'Eng_5R_1E_07_04_04', subject: 'eng', grade: 5, term: 1, track: 'E', unit: 7, lesson: 4, loIndex: 4 },
    { raw: 'Soc_5R_1A_02_03_02', subject: 'soc', grade: 5, term: 1, track: 'A', unit: 2, lesson: 3, loIndex: 2 },
    { raw: 'Mul_2R_1E_01_03_01', subject: 'mul', grade: 2, term: 1, track: 'E', unit: 1, lesson: 3, loIndex: 1 },
    { raw: 'Rel_3R_1A_05_02_01', subject: 'rel', grade: 3, term: 1, track: 'A', unit: 5, lesson: 2, loIndex: 1 },
    { raw: 'Ict_5R_1A_01_02_01', subject: 'ict', grade: 5, term: 1, track: 'A', unit: 1, lesson: 2, loIndex: 1 },
    { raw: 'Tsk_1R_1A_01_01_01', subject: 'tsk', grade: 1, term: 1, track: 'A', unit: 1, lesson: 1, loIndex: 1 },
    { raw: '2026_eng_4r_1e_02_02_03', subject: 'eng', grade: 4, term: 1, track: 'E', unit: 2, lesson: 2, loIndex: 3 },
    { raw: '2026_ara_2r_1a_02_05_03', subject: 'ara', grade: 2, term: 1, track: 'A', unit: 2, lesson: 5, loIndex: 3 },
    { raw: 'QR_mth_1r_1a_02_02_06', subject: 'mth', grade: 1, term: 1, track: 'A', unit: 2, lesson: 2, loIndex: 6 },
    { raw: 'QR_2025_ara_3r_1a_01_01_01', subject: 'ara', grade: 3, term: 1, track: 'A', unit: 1, lesson: 1, loIndex: 1 },
    { raw: 'Soc_4R_1A_01_04_03_p2', subject: 'soc', grade: 4, term: 1, track: 'A', unit: 1, lesson: 4, loIndex: 3 },
  ];

  for (const sample of samples) {
    it(`parses ${sample.raw}`, () => {
      const code = tryParseLoCode(sample.raw);
      assert.ok(code);
      assert.equal(code.subjectCode, sample.subject);
      assert.equal(code.grade, sample.grade);
      assert.equal(code.termNumber, sample.term);
      assert.equal(code.track, sample.track);
      assert.equal(code.unit, sample.unit);
      assert.equal(code.lesson, sample.lesson);
      assert.equal(code.loIndex, sample.loIndex);
    });
  }

  it('captures QR prefix, year, and part suffix', () => {
    const withPrefix = tryParseLoCode('QR_2025_ara_3r_1a_01_01_01');
    assert.equal(withPrefix?.prefix, 'QR');
    assert.equal(withPrefix?.year, 2025);
    assert.equal(tryParseLoCode('Soc_4R_1A_01_04_03_p2')?.suffix, 'p2');
  });

  it('returns null for unparseable names', () => {
    assert.equal(tryParseLoCode('Solve linear equations'), null);
    assert.equal(tryParseLoCode('Mth_5R'), null);
    assert.equal(tryParseLoCode(''), null);
  });
});

describe('lo-code formatter', () => {
  it('formats English labels', () => {
    assert.equal(
      formatLoCode('Mth_5R_1A_01_04_02'),
      'Math · Grade 5 · Term 1 (Arabic) · Unit 1 · Lesson 4 · LO 2',
    );
    assert.equal(
      formatLoCode('2026_eng_4r_1e_02_02_03', 'en'),
      '2026 · English · Grade 4 · Term 1 (English) · Unit 2 · Lesson 2 · LO 3',
    );
    assert.equal(
      formatLoCode('QR_mth_1r_1a_02_02_06'),
      'QR · Math · Grade 1 · Term 1 (Arabic) · Unit 2 · Lesson 2 · LO 6',
    );
    assert.equal(
      formatLoCode('Soc_4R_1A_01_04_03_p2'),
      'Social Studies · Grade 4 · Term 1 (Arabic) · Unit 1 · Lesson 4 · LO 3 · Part 2',
    );
  });

  it('formats Arabic labels', () => {
    assert.equal(
      formatLoCode('Mth_5R_1A_01_04_02', 'ar'),
      'الرياضيات · الصف 5 · الفصل الدراسي الأول (عربي) · الوحدة 1 · الدرس 4 · الهدف 2',
    );
    assert.equal(
      formatLoCode('Eng_5R_1E_07_04_04', 'ar'),
      'اللغة الإنجليزية · الصف 5 · الفصل الدراسي الأول (إنجليزي) · الوحدة 7 · الدرس 4 · الهدف 4',
    );
    assert.equal(
      formatLoCode('Soc_4R_1A_01_04_03_p2', 'ar'),
      'الدراسات الاجتماعية · الصف 4 · الفصل الدراسي الأول (عربي) · الوحدة 1 · الدرس 4 · الهدف 3 · الجزء 2',
    );
  });

  it('returns the original name when the value is not a code', () => {
    assert.equal(formatLoCode('Solve linear equations'), 'Solve linear equations');
    assert.equal(formatLoCode('Solve linear equations', 'ar'), 'Solve linear equations');
    assert.equal(formatLoCode(null), '');
  });
});

describe('lo-code seed', () => {
  it('maps every catalog subject code to a full name', () => {
    const seeded = new Set(
      LO_CODE_SEED_SAMPLES.map((code) => tryParseLoCode(code)?.subjectCode).filter((code): code is string => !!code),
    );
    for (const code of Object.keys(LO_CODE_SUBJECTS)) {
      assert.ok(seeded.has(code), `missing seed for ${code}`);
    }
  });

  it('builds Math Grade 5 from Mth_5R_1A_01_04_02', () => {
    const parsed = tryParseLoCode('Mth_5R_1A_01_04_02');
    assert.ok(parsed);
    assert.equal(subjectName(parsed.subjectCode, 'en'), 'Math');
    assert.equal(`${subjectName(parsed.subjectCode, 'en')} ${gradeLabel(parsed.grade, 'en')}`, 'Math Grade 5');
    assert.equal(termLabel(parsed.termNumber, parsed.track, 'en'), 'Term 1 (Arabic)');
    assert.equal(unitLabel(parsed.unit, 'en'), 'Unit 1');
    assert.equal(lessonLabel(parsed.lesson, 'en'), 'Lesson 4');
  });
});
