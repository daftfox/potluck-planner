import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminUser } from '../models/admin-user.model';
import { UserRole } from '../models/user-role.model';
import { SessionService } from './session.service';

/** Client for the `/api/admin` endpoint. */
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly usersUrl = '/api/admin/users';

  getUsers(): Observable<AdminUser[]> {
    return this.session.requireSignedIn(() => this.http.get<AdminUser[]>(this.usersUrl));
  }

  updateUserRole(userId: string, role: UserRole): Observable<AdminUser> {
    return this.session.requireSignedIn(() =>
      this.http.patch<AdminUser>(`${this.userUrl(userId)}/role`, { role }),
    );
  }

  deleteUser(userId: string): Observable<AdminUser> {
    return this.session.requireSignedIn(() => this.http.delete<AdminUser>(this.userUrl(userId)));
  }

  private userUrl(userId: string): string {
    return `${this.usersUrl}/${encodeURIComponent(userId)}`;
  }
}
