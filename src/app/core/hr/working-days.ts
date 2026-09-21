export interface HolidayDateRange {
  startDate: string;
  endDate: string;
}

const FRIDAY = 5;
const SATURDAY = 6;

function parseLocalDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00`);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === FRIDAY || day === SATURDAY;
}

export function isHoliday(isoDate: string, holidays: HolidayDateRange[]): boolean {
  return holidays.some((holiday) => isoDate >= holiday.startDate && isoDate <= holiday.endDate);
}

export function countWorkingDays(
  startDate: string,
  endDate: string,
  holidays: HolidayDateRange[] = [],
): number {
  if (!startDate || !endDate || endDate < startDate) {
    return 0;
  }

  let count = 0;
  const cursor = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  while (cursor <= end) {
    const iso = toIsoDate(cursor);
    if (!isWeekend(cursor) && !isHoliday(iso, holidays)) {
      count += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}
