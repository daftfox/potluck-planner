import { computed, Injectable, signal } from '@angular/core';
import { defer, Observable, throwError } from 'rxjs';
import { UserProfile } from '../models/user-profile.model';
import { UserRole } from '../models/user-role.model';

const TOKEN_STORAGE_KEY = 'potluck-session';

function emptyProfile(): UserProfile {
  return {
    id: '',
    username: null,
    name: '',
    role: UserRole.MEMBER,
    dietaryPreferences: [],
  };
}

/** Holds the signed-in user's token and profile; shared by the endpoint services. */
@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly tokenState = signal(this.readToken());
  readonly token = this.tokenState.asReadonly();
  private readonly authenticated = signal(false);
  readonly signedIn = this.authenticated.asReadonly();
  private readonly profile = signal<UserProfile>(emptyProfile());
  readonly currentUser = this.profile.asReadonly();
  readonly isAdmin = computed(() => this.signedIn() && this.currentUser().role === UserRole.ADMIN);

  start(token: string, user: UserProfile): void {
    this.saveToken(token);
    this.setCurrentUser(user);
  }

  setCurrentUser(user: UserProfile): void {
    this.profile.set(user);
    this.authenticated.set(true);
  }

  clear(): void {
    this.saveToken(null);
    this.authenticated.set(false);
    this.profile.set(emptyProfile());
  }

  /** Runs `request` only when a user is signed in; otherwise errors without calling the API. */
  requireSignedIn<T>(request: () => Observable<T>): Observable<T> {
    return defer(() => this.signedIn()
      ? request()
      : throwError(() => new Error('Please log in to continue.')));
  }

  private readToken(): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private saveToken(token: string | null): void {
    this.tokenState.set(token);
    if (typeof localStorage === 'undefined') return;
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}
