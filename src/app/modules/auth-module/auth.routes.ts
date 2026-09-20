import { Routes } from '@angular/router';
import { SIGN_IN_DI_CONTAINER } from './features/sign-in-screen/di_container';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/sign-in-screen/presentation/auth-layout.component').then(
        (m) => m.AuthLayoutComponent,
      ),
    children: [
      { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
      {
        path: 'sign-in',
        providers: SIGN_IN_DI_CONTAINER,
        loadComponent: () =>
          import('./features/sign-in-screen/presentation/sign-in.component').then(
            (m) => m.SignInComponent,
          ),
      },
    ],
  },
];
