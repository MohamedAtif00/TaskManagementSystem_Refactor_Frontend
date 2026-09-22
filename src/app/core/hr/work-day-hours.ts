export const WORK_DAY_START = '09:00';
export const WORK_DAY_END = '17:00';
export const WORK_DAY_SLOT_MINUTES = 60;

export const EARLY_DEPARTURE_START = '13:00';
export const LATE_ARRIVAL_START = '10:00';
export const LATE_ARRIVAL_END = '13:00';

export type WorkDaySlotPreset = 'full' | 'earlyDeparture' | 'lateArrival';

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function listSlotsBetween(startTime: string, endTime: string): string[] {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const slots: string[] = [];
  for (let minutes = start; minutes <= end; minutes += WORK_DAY_SLOT_MINUTES) {
    slots.push(formatMinutes(minutes));
  }
  return slots;
}

export function listWorkDaySlots(): string[] {
  return listSlotsBetween(WORK_DAY_START, WORK_DAY_END);
}

export function listEarlyDepartureSlots(): string[] {
  return listSlotsBetween(EARLY_DEPARTURE_START, '16:00');
}

export function listLateArrivalSlots(): string[] {
  return listSlotsBetween(LATE_ARRIVAL_START, LATE_ARRIVAL_END);
}

export function listSlotsForPreset(preset: WorkDaySlotPreset): string[] {
  if (preset === 'earlyDeparture') {
    return listEarlyDepartureSlots();
  }
  if (preset === 'lateArrival') {
    return listLateArrivalSlots();
  }
  return listWorkDaySlots();
}

export function slotsAfter(fromTime: string, preset: WorkDaySlotPreset = 'full'): string[] {
  const fromMinutes = parseTime(fromTime);
  return listSlotsForPreset(preset).filter((slot) => parseTime(slot) > fromMinutes);
}

export function isWithinWorkDay(time: string): boolean {
  const minutes = parseTime(time);
  return minutes >= parseTime(WORK_DAY_START) && minutes <= parseTime(WORK_DAY_END);
}

export function isWithinEarlyDepartureSlot(time: string): boolean {
  return listEarlyDepartureSlots().includes(time);
}

export function isWithinLateArrivalSlot(time: string): boolean {
  return listLateArrivalSlots().includes(time);
}

export function isValidWorkDayRange(fromTime: string, toTime: string): boolean {
  return isWithinWorkDay(fromTime) && isWithinWorkDay(toTime) && parseTime(toTime) > parseTime(fromTime);
}

export function formatWorkDayTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return minutes === 0 ? `${hour12}:00 ${period}` : `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function workDayRangePercent(fromTime: string, toTime: string): { start: number; width: number } {
  const dayStart = parseTime(WORK_DAY_START);
  const dayEnd = parseTime(WORK_DAY_END);
  const span = dayEnd - dayStart;
  const from = Math.max(parseTime(fromTime), dayStart);
  const to = Math.min(parseTime(toTime), dayEnd);
  const start = ((from - dayStart) / span) * 100;
  const rawWidth = ((to - from) / span) * 100;
  const width = rawWidth <= 0 ? 2 : rawWidth;
  return { start, width };
}
