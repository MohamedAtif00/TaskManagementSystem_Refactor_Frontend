import { Component, input } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-stat-card',
  imports: [AngularSvgIconModule],
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  icon = input('assets/icons/heroicons/outline/chart-pie.svg');
  hint = input('');
}
