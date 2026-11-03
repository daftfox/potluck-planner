import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, defer, map, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { DishSuitability } from '../models/dish-suitability.model';
import { UserProfile } from '../models/user-profile.model';
import { PotlucksService } from './potlucks.service';
import { SessionService } from './session.service';

/** Client for the `/api/auth` endpoint. */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly potlucks = inject(PotlucksService);
  private readonly baseUrl = '/api/auth';

  /** Restores the user for a stored token; a rejected token is discarded. */
  restoreSession(): Observable<void> {
    return defer(() => {
      if (!this.session.token()) return of(undefined);
      return this.http.get<UserProfile>(`${this.baseUrl}/me`).pipe(
        map((user) => this.session.setCurrentUser(user)),
        catchError((error: unknown) => {
          if (!(error instanceof HttpErrorResponse) || error.status !== 401) return throwError(() => error);
          this.session.clear();
          return of(undefined);
        }),
      );
    });
  }

  register(
    username: string,
    name: string,
    password: string,
    dietaryPreferences: DishSuitability[],
  ): Observable<void> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, {
      username,
      name,
      password,
      dietaryPreferences,
    }).pipe(switchMap((response) => this.startSession(response)));
  }

  login(username: string, password: string): Observable<void> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(switchMap((response) => this.startSession(response)));
  }

  /** Signs out locally even if the server call fails, then reloads public pot-luck data. */
  logout(): Observable<void> {
    return defer(() => this.session.token()
      ? this.http.post<void>(`${this.baseUrl}/logout`, {})
      : of(undefined),
    ).pipe(
      catchError(() => of(undefined)),
      switchMap(() => {
        this.session.clear();
        this.potlucks.clearUserState();
        return this.reloadPotlucks();
      }),
    );
  }

  private startSession(response: AuthResponse): Observable<void> {
    this.session.start(response.token, response.user);
    return this.reloadPotlucks();
  }

  // Load failures are already reported by the API interceptor and shouldn't fail sign in/out.
  private reloadPotlucks(): Observable<void> {
    return this.potlucks.load().pipe(catchError(() => of(undefined)));
  }
}
