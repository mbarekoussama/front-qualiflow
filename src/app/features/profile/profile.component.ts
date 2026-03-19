import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly currentUser = this.auth.currentUser;
  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);
  readonly profileMessage = signal('');
  readonly passwordMessage = signal('');
  readonly showPassword = signal(false);
  readonly avatarDataUrl = signal<string | null>(null);

  readonly profileForm = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.maxLength(60)]],
    prenom: ['', [Validators.required, Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email]]
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator }
  );

  private readonly _syncUserForm = effect(() => {
    const user = this.currentUser();
    if (!user) return;

    this.profileForm.patchValue({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email
    });

    this.avatarDataUrl.set(this.loadAvatar(user.id) ?? user.avatar ?? null);
  });

  readonly userLabel = computed(() => {
    const user = this.currentUser();
    return user ? `${user.prenom} ${user.nom}` : '';
  });

  readonly roleLabel = computed(() => this.currentUser()?.role ?? '');
  readonly organisationId = computed(() => this.currentUser()?.organisationId ?? '—');

  readonly displayedAvatar = computed(() => this.avatarDataUrl() ?? this.currentUser()?.avatar ?? null);

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onPhotoSelected(event: Event): void {
    const user = this.currentUser();
    if (!user) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.profileMessage.set('Le fichier doit être une image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : null;
      if (!value) return;

      this.avatarDataUrl.set(value);
      this.saveAvatar(user.id, value);
      this.auth.updateCurrentUser({ avatar: value });
      this.profileMessage.set('Photo de profil mise à jour.');
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    const user = this.currentUser();
    if (!user) return;

    this.avatarDataUrl.set(null);
    this.saveAvatar(user.id, null);
    this.auth.updateCurrentUser({ avatar: undefined });
    this.profileMessage.set('Photo de profil supprimée.');
  }

  submitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const value = this.profileForm.getRawValue();
    this.savingProfile.set(true);
    this.profileMessage.set('');

    this.auth
      .updateProfile({
        nom: value.nom.trim(),
        prenom: value.prenom.trim(),
        email: value.email.trim()
      })
      .subscribe({
        next: () => {
          this.savingProfile.set(false);
          this.profileMessage.set('Informations du profil mises à jour.');
        },
        error: (err: Error) => {
          this.savingProfile.set(false);
          this.profileMessage.set(err.message);
        }
      });
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.getRawValue();
    this.savingPassword.set(true);
    this.passwordMessage.set('');

    this.auth
      .updatePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword
      })
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.passwordMessage.set('Mot de passe mis à jour.');
          this.passwordForm.reset({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        },
        error: (err: Error) => {
          this.savingPassword.set(false);
          this.passwordMessage.set(err.message);
        }
      });
  }

  private avatarStorageKey(userId: string): string {
    return `qf_avatar_${userId}`;
  }

  private loadAvatar(userId: string): string | null {
    try {
      return localStorage.getItem(this.avatarStorageKey(userId));
    } catch {
      return null;
    }
  }

  private saveAvatar(userId: string, value: string | null): void {
    try {
      if (value) {
        localStorage.setItem(this.avatarStorageKey(userId), value);
      } else {
        localStorage.removeItem(this.avatarStorageKey(userId));
      }
    } catch {
      // ignore storage errors
    }
  }

  logout(): void {
    this.auth.logout();
  }
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('newPassword')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordsMismatch: true } : null;
}
