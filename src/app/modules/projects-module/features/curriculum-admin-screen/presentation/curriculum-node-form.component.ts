import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoCodeDisplayService } from '@core/lo-code/lo-code-display.service';
import { ButtonComponent } from '@shared/component/button/button.component';
import { LoCodeLabelPipe } from '@shared/pipes/lo-code-label.pipe';
import {
  CurriculumSchemaOption,
  CurriculumUserOption,
  SaveCurriculumPayload,
} from '../domain/entity/curriculum-admin.entity';
import { SUBJECT_STATUSES, labelOf } from './curriculum-admin.constants';

@Component({
  selector: 'app-curriculum-node-form',
  imports: [FormsModule, ButtonComponent, LoCodeLabelPipe],
  templateUrl: './curriculum-node-form.component.html',
})
export class CurriculumNodeFormComponent {
  readonly loDisplay = inject(LoCodeDisplayService);
  readonly labelOf = labelOf;
  readonly statuses = SUBJECT_STATUSES;

  @Input({ required: true }) form!: SaveCurriculumPayload;
  @Input() schemas: CurriculumSchemaOption[] = [];
  @Input() users: CurriculumUserOption[] = [];
  @Input() formError = '';
  @Input() selectedUserIds: number[] = [];

  @Output() save = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() toggleUser = new EventEmitter<{ userId: number; checked: boolean }>();

  isUserSelected(id: number): boolean {
    return this.selectedUserIds.includes(id);
  }
}
