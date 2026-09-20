import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ThemeService } from '@core/services/theme.service';
import { ResponsiveHelperComponent } from '@shared/component/responsive-helper/responsive-helper.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, ResponsiveHelperComponent, NgxSonnerToaster],
})
export class App {
  constructor(public themeService: ThemeService) {}
}
