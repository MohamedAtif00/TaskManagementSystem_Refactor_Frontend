import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from '@shared/component/button/button.component';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';

@Component({
  selector: 'app-error404',
  imports: [AngularSvgIconModule, ButtonComponent],
  templateUrl: './error404.component.html',
})
export class Error404Component {
  constructor(private router: Router) {}

  goToHomePage() {
    this.router.navigate([ROUTE_PATHS.dashboard]);
  }
}
