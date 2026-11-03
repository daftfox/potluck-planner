import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DishSuitability } from '../models/dish-suitability.model';
import { UserProfile } from '../models/user-profile.model';
import { SessionService } from './session.service';

/** Client for the `/api/profile` endpoint. */
@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly baseUrl = '/api/profile';

  update(name: string, dietaryPreferences: DishSuitability[]): Observable<void> {
    return this.session.requireSignedIn(() =>
      this.http.patch<UserProfile>(this.baseUrl, { name, dietaryPreferences }),
    ).pipe(map((user) => this.session.setCurrentUser(user)));
  }
}
