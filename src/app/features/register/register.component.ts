import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { RoleGlobal } from './register.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly fb   = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading    = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);
  readonly success      = signal(false);

  readonly roles: { label: string; value: RoleGlobal }[] = [
    { label: 'Utilisateur',          value: 'UTILISATEUR' },
    { label: 'Auditeur',             value: 'AUDITEUR' },
    { label: 'Responsable SMQ',      value: 'RESPONSABLE_SMQ' },
    { label: 'Administrateur',       value: 'ADMIN_ORG' }
  ];

  readonly form = this.fb.nonNullable.group(
    {
      nom:              ['', [Validators.required, Validators.maxLength(60)]],
      prenom:           ['', [Validators.required, Validators.maxLength(60)]],
      email:            ['', [Validators.required, Validators.email]],
      fonction:         [''],
      organisationCode: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{2,10}$/)]],
      role:             ['UTILISATEUR' as RoleGlobal],
      password:         ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword:  ['', Validators.required]
    },
    { validators: passwordsMatchValidator }
  );

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const v = this.form.getRawValue();
    this.auth.register({
      nom:              v.nom,
      prenom:           v.prenom,
      email:            v.email,
      password:         v.password,
      organisationCode: v.organisationCode.toUpperCase(),
      fonction:         v.fonction || undefined,
      role:             v.role
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message);
      }
    });
  }
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordsMismatch: true } : null;
}
