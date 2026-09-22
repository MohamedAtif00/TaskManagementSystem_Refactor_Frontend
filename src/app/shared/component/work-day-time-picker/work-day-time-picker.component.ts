import { ChangeDetectionStrategy, Component, computed, effect, input, model } from '@angular/core';
import {
  WORK_DAY_END,
  WORK_DAY_START,
  WorkDaySlotPreset,
  formatWorkDayTime,
  listSlotsForPreset,
  slotsAfter,
  workDayRangePercent,
} from '@core/hr/work-day-hours';

type PickerMode = 'single' | 'range';
type SingleField = 'from' | 'to';

function parseTimeValue(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

@Component({
  selector: 'app-work-day-time-picker',
  templateUrl: './work-day-time-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkDayTimePickerComponent {
  mode = input<PickerMode>('range');
  singleField = input<SingleField>('from');
  slotPreset = input<WorkDaySlotPreset>('full');
  label = input('Time');
  fromLabel = input('From');
  toLabel = input('To');

  fromTime = model(WORK_DAY_START);
  toTime = model('11:00');

  readonly workDayStartLabel = formatWorkDayTime(WORK_DAY_START);
  readonly workDayEndLabel = formatWorkDayTime(WORK_DAY_END);
  readonly formatSlot = formatWorkDayTime;

  readonly slots = computed(() => listSlotsForPreset(this.slotPreset()));

  readonly toSlots = computed(() => slotsAfter(this.fromTime(), this.slotPreset()));

  readonly timeline = computed(() => workDayRangePercent(this.fromTime(), this.toTime()));

  constructor() {
    effect(() => {
      if (this.mode() !== 'range') {
        return;
      }
      const from = this.fromTime();
      const to = this.toTime();
      if (parseTimeValue(to) <= parseTimeValue(from)) {
        const next = slotsAfter(from, this.slotPreset())[0];
        if (next) {
          this.toTime.set(next);
        }
      }
    });
  }

  selectFrom(slot: string): void {
    this.fromTime.set(slot);
  }

  selectTo(slot: string): void {
    this.toTime.set(slot);
  }

  selectSingle(slot: string): void {
    if (this.singleField() === 'from') {
      this.fromTime.set(slot);
      return;
    }
    this.toTime.set(slot);
  }

  isFromSelected(slot: string): boolean {
    return this.fromTime() === slot;
  }

  isToSelected(slot: string): boolean {
    return this.toTime() === slot;
  }

  isSingleSelected(slot: string): boolean {
    return this.singleField() === 'from' ? this.fromTime() === slot : this.toTime() === slot;
  }

  isToDisabled(slot: string): boolean {
    return parseTimeValue(slot) <= parseTimeValue(this.fromTime());
  }
}
