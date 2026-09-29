import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { HttpActivityService } from '@core/network/http-activity.service';

export const httpActivityInterceptor: HttpInterceptorFn = (req, next) => {
  const activity = inject(HttpActivityService);
  activity.begin();
  return next(req).pipe(finalize(() => activity.end()));
};
