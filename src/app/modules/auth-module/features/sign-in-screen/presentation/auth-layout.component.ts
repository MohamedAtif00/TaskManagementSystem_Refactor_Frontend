import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { APP_VERSION } from '@core/constants/app-version';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css'],
  imports: [AngularSvgIconModule, RouterOutlet],
})
export class AuthLayoutComponent {
  readonly version = APP_VERSION;
}
