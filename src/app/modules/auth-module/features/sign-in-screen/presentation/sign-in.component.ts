import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';
import { AuthService } from '@core/services/auth.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { ButtonComponent } from '@shared/component/button/button.component';
import { SignInUseCase } from '../domain/usecase/sign-in.usecase';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  imports: [ReactiveFormsModule, AngularSvgIconModule, ButtonComponent, NgClass],
})
export class SignInComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly signInUseCase: SignInUseCase,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      code: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(6)]],
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid || this.loading) {
      return;
    }

    this.loading = true;
    this.signInUseCase
      .execute(this.form.value.code)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (user) => {
          this.authService.setSession(user);
          this.router.navigate([ROUTE_PATHS.dashboard]);
        },
        error: (err: Error) => {
          toast.error(err.message || 'Invalid employee code');
        },
      });
  }
}
