import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_VERSION } from '@core/constants/app-version';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  standalone: true,
  imports: [RouterLink],
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  readonly version = APP_VERSION;
}
