import { Component } from '@angular/core';
import { APP_VERSION } from '@core/constants/app-version';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  standalone: true,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  readonly version = APP_VERSION;
}
