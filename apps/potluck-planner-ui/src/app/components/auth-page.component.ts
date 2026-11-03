import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, switchMap, tap } from 'rxjs';
import { DishSuitability } from '../models/dish-suitability.model';
import { AuthService } from '../services/auth.service';
import { ApiErrorService } from '../services/api-error.service';
import { DietarySelectorComponent } from './dietary-selector.component';
import { PotButtonComponent } from './pot-button.component';
import { SmoothHeightDirective } from './smooth-height.directive';

@Component({
  selector: 'pot-auth-page',
  standalone: true,
  imports: [FormsModule, RouterLink, DietarySelectorComponent, PotButtonComponent, SmoothHeightDirective],
  template: `
    <section class="auth-page" animate.enter="fade-in" animate.leave="fade-out">
      <header>
        <h1>{{ registering() ? 'Join the table' : 'Welcome back' }}</h1>
        <p class="text-muted-foreground">{{ registering() ? 'Create your profile and share something delicious.' : 'Log in to plan your next shared meal.' }}</p>
      </header>
      <form class="card p-5" (ngSubmit)="submit()">
        <fieldset [disabled]="busy()">
          <div>
            <label for="auth-username">Username</label>
            <input id="auth-username" name="username" autocomplete="username" required
              maxlength="80" pattern="[a-zA-Z0-9._\\-]+"
              [attr.aria-describedby]="registering() ? 'username-help' : null"
              [ngModel]="username()" (ngModelChange)="username.set($event)" />
            @if (registering()) {
              <p id="username-help" class="text-sm text-muted-foreground">Letters, numbers, dots, underscores, and hyphens only. Your username cannot be changed.</p>
            }
          </div>
          @if (registering()) {
            <div>
              <label for="auth-name">Display name</label>
              <input id="auth-name" name="displayName" autocomplete="nickname" required maxlength="80"
                [ngModel]="name()" (ngModelChange)="name.set($event)" />
            </div>
          }
          <div>
            <label for="auth-password">Password</label>
            <input id="auth-password" name="password" type="password" required
              [attr.autocomplete]="registering() ? 'new-password' : 'current-password'"
              [minlength]="registering() ? 8 : 1"
              [ngModel]="password()" (ngModelChange)="password.set($event)" />
            @if (registering()) {
              <p class="text-sm text-muted-foreground" animate.enter="fade-in" animate.leave="fade-out">Use at least 8 characters.</p>
            }
          </div>
          @if (registering()) {
            <div animate.enter="fade-in" animate.leave="fade-out">
              <label for="auth-confirm">Confirm password</label>
              <input id="auth-confirm" name="confirmPassword" type="password" autocomplete="new-password" required
                [ngModel]="confirmation()" (ngModelChange)="confirmation.set($event)" />
            </div>
            <dietary-selector label="Dietary preferences (this can be changed later)" [selected]="preferences()" [disabled]="busy()"
              (selectedChange)="preferences.set($event)" animate.enter="fade-in" animate.leave="fade-out" />
          }
          <div smoothHeight aria-live="polite">
            <div>
              @if (error()) {
                <p class="error" role="alert" animate.enter="fade-in" animate.leave="fade-out">{{ error() }}</p>
              }
            </div>
          </div>
          <pot-button type="submit" variant="primary" [disabled]="busy()">
            {{ busy() ? 'Please wait...' : registering() ? 'Create account' : 'Log in' }}
          </pot-button>
        </fieldset>
        @if (registering()) {
          <p animate.enter="fade-in" animate.leave="fade-out">Already have an account? <a routerLink="/login">Log in</a></p>
        } @else {
          <p animate.enter="fade-in" animate.leave="fade-out">New to the club? <a routerLink="/register">Create an account</a></p>
        }
        <p class="text-sm text-muted-foreground">Your account is stored securely so you can return to your plans.</p>
      </form>
    </section>
  `,
  styles: `
    .auth-page { max-width: 40rem; margin: 2rem auto; }
    header { margin-bottom: 1.5rem; }
    fieldset { display: flex; flex-direction: column; gap: 1rem; min-width: 0; border: 0; padding: 0; margin: 0 0 1.5rem; }
    label { display: block; margin-bottom: 0.25rem; }
    form > p + p { margin-top: 1rem; }
    a { color: var(--color-primary); }
    .error { color: var(--color-error); }
  `,
})
export class AuthPageComponent {
  private readonly auth = inject(AuthService);
  private readonly apiErrors = inject(ApiErrorService);
  private readonly router = inject(Router);
  protected readonly registering = signal(inject(ActivatedRoute).snapshot.data['registering'] === true);
  protected readonly username = signal('');
  protected readonly name = signal('');
  protected readonly password = signal('');
  protected readonly confirmation = signal('');
  protected readonly preferences = signal<DishSuitability[]>([]);
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected submit(): void {
    if (this.busy()) return;
    this.error.set('');
    if (!this.username().trim() || !this.password()) {
      this.error.set('Enter your username and password.');
      return;
    }
    if (!/^[a-zA-Z0-9._-]{1,80}$/.test(this.username().trim())) {
      this.error.set('Use 1 to 80 letters, numbers, dots, underscores, or hyphens for your username.');
      return;
    }
    if (this.registering() && !this.name().trim()) {
      this.error.set('Enter your display name.');
      return;
    }
    if (this.registering() && this.password().length < 8) {
      this.error.set('Use a password with at least 8 characters.');
      return;
    }
    if (this.registering() && this.password() !== this.confirmation()) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.busy.set(true);
    const signIn$ = this.registering()
      ? this.auth.register(this.username().trim(), this.name(), this.password(), this.preferences())
      : this.auth.login(this.username().trim(), this.password());
    signIn$.pipe(
      tap(() => {
        this.password.set('');
        this.confirmation.set('');
      }),
      switchMap(() => this.router.navigateByUrl('/profile')),
      finalize(() => this.busy.set(false)),
    ).subscribe({
      error: (error: unknown) =>
        this.error.set(this.apiErrors.toMessage(error)),
    });
  }
}
