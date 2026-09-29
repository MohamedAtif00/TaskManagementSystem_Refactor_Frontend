import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { apiFailureInterceptor } from '@core/interceptors/api-failure.interceptor';
import { authRefreshInterceptor } from '@core/interceptors/auth-refresh.interceptor';
import { httpActivityInterceptor } from '@core/interceptors/http-activity.interceptor';
import { jwtInterceptor } from '@core/interceptors/jwt.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withXhr(),
      withInterceptors([httpActivityInterceptor, jwtInterceptor, authRefreshInterceptor, apiFailureInterceptor]),
    ),
    importProvidersFrom(AngularSvgIconModule.forRoot()),
  ],
};
