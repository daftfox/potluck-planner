import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminUser } from '../models/admin-user.model';
import { UserRole } from '../models/user-role.model';
import { AdminService } from '../services/admin.service';
import { ApiErrorService } from '../services/api-error.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  template: `
    <main class="admin-page">
      <header class="admin-heading">
        <h1>People</h1>
        <p>Manage Coconut Club Kai Time access and roles.</p>
      </header>

      <section class="admin-directory card" aria-labelledby="directory-heading">
        <div class="directory-heading">
          <div>
            <h2 id="directory-heading">Member directory</h2>
            <p>Members can organise pot-lucks. Admins can also manage people and events.</p>
          </div>
          @if (!loading()) {
            <span class="member-count">{{ users().length }} {{ users().length === 1 ? 'person' : 'people' }}</span>
          }
        </div>

        @if (error()) {
          <p class="directory-message error" role="alert">{{ error() }}</p>
          <button class="text-action" type="button" (click)="loadUsers()">Try again</button>
        } @else if (loading()) {
          <p class="directory-message" role="status">Loading people…</p>
        } @else if (users().length === 0) {
          <p class="directory-message">No accounts have been created yet.</p>
        } @else {
          <div class="member-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users(); track user.id) {
                  <tr>
                    <td>
                      <span class="member-name">{{ user.name }}</span>
                      <p class="you-label">{{ user.username ?? 'No username assigned' }}</p>
                      @if (user.id === currentUserId) {
                        <span class="you-label">You</span>
                      }
                    </td>
                    <td>
                      <select
                        [value]="user.role"
                        [disabled]="user.id === currentUserId || savingUserId() === user.id || deletingUserId() === user.id"
                        [attr.aria-label]="'Role for ' + user.name"
                        (change)="changeRole(user, $event)"
                      >
                        <option [value]="UserRole.MEMBER">Member</option>
                        <option [value]="UserRole.ADMIN">Admin</option>
                      </select>
                    </td>
                    <td>
                      <button
                        class="delete-action"
                        type="button"
                        [disabled]="!canDeleteUser(user) || savingUserId() === user.id || deletingUserId() === user.id"
                        [attr.aria-label]="'Delete ' + user.name"
                        (click)="deleteUser(user)"
                      >
                        {{ deletingUserId() === user.id ? 'Deleting…' : 'Delete' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="member-cards">
            @for (user of users(); track user.id) {
              <article class="member-row">
                <div>
                  <h3>{{ user.name }}</h3>
                  <p class="you-label">{{ user.username ?? 'No username assigned' }}</p>
                  @if (user.id === currentUserId) {
                    <p class="you-label">You</p>
                  }
                </div>
                <label>
                  <span>Role</span>
                  <select
                    [value]="user.role"
                    [disabled]="user.id === currentUserId || savingUserId() === user.id || deletingUserId() === user.id"
                    [attr.aria-label]="'Role for ' + user.name"
                    (change)="changeRole(user, $event)"
                  >
                    <option [value]="UserRole.MEMBER">Member</option>
                    <option [value]="UserRole.ADMIN">Admin</option>
                  </select>
                </label>
                <button
                  class="delete-action"
                  type="button"
                  [disabled]="!canDeleteUser(user) || savingUserId() === user.id || deletingUserId() === user.id"
                  [attr.aria-label]="'Delete ' + user.name"
                  (click)="deleteUser(user)"
                >
                  {{ deletingUserId() === user.id ? 'Deleting…' : 'Delete' }}
                </button>
              </article>
            }
          </div>
        }

        @if (notice()) {
          <p class="directory-message" role="status">{{ notice() }}</p>
        }
        <p class="role-note">You cannot change or delete your own account. The last administrator cannot be deleted.</p>
      </section>
    </main>
  `,
  styles: `
    .admin-page {
      display: grid;
      gap: 1.5rem;
    }

    .admin-heading h1 {
      font-size: var(--font-size-2xl);
      line-height: var(--line-height-2xl);
    }

    .admin-heading p,
    .directory-heading p,
    .role-note {
      color: var(--color-text-muted);
    }

    .admin-directory {
      padding: 1.25rem;
    }

    .directory-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .directory-heading h2 {
      font-size: var(--font-size-lg);
      line-height: var(--line-height-lg);
    }

    .directory-heading p,
    .role-note {
      margin-top: 0.25rem;
      font-size: var(--font-size-sm);
      line-height: var(--line-height-base);
    }

    .member-count,
    .you-label {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }

    .member-table table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th {
      height: 2.5rem;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    td {
      height: 3.5rem;
      border-top: 1px solid var(--color-border);
    }

    th:last-child,
    td:last-child {
      width: 7rem;
    }

    .member-name {
      font-weight: var(--font-weight-medium);
    }

    .member-table select,
    .member-cards select {
      min-height: 2.5rem;
      width: 100%;
      border: 1px solid var(--color-border-input);
      border-radius: var(--border-radius-sm);
      background: var(--color-background);
      color: var(--color-text);
      padding: 0.4rem 0.65rem;
      font: inherit;
    }

    .delete-action {
      min-height: 2.5rem;
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--color-error);
      border-radius: var(--border-radius-sm);
      background: transparent;
      color: var(--color-error);
      cursor: pointer;
      font: inherit;
    }

    .delete-action:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    select:focus-visible,
    .text-action:focus-visible,
    .delete-action:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    select:disabled {
      color: var(--color-text-muted);
      cursor: not-allowed;
    }

    .member-cards {
      display: none;
    }

    .directory-message {
      margin-top: 1rem;
    }

    .error {
      color: var(--color-error);
    }

    .text-action {
      margin-top: 0.5rem;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--color-primary);
      cursor: pointer;
      font: inherit;
    }

    .role-note {
      margin-top: 1rem;
    }

    @media (max-width: 640px) {
      .admin-directory {
        padding: 1rem;
      }

      .directory-heading {
        flex-direction: column;
      }

      .member-table {
        display: none;
      }

      .member-cards {
        display: grid;
      }

      .member-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(8rem, 0.8fr);
        align-items: center;
        gap: 1rem;
        padding: 0.875rem 0;
        border-top: 1px solid var(--color-border);
      }

      .member-row .delete-action {
        grid-column: 1;
        justify-self: start;
      }

      .member-row h3 {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-medium);
      }

      .member-row label span {
        display: block;
        margin-bottom: 0.35rem;
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
      }
    }
  `,
})
export class AdminPageComponent {
  private readonly admin = inject(AdminService);
  private readonly apiError = inject(ApiErrorService);
  protected readonly UserRole = UserRole;
  protected readonly currentUserId = inject(SessionService).currentUser().id;
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly loading = signal(true);
  protected readonly savingUserId = signal('');
  protected readonly deletingUserId = signal('');
  protected readonly error = signal('');
  protected readonly notice = signal('');

  constructor() {
    this.loadUsers();
  }

  protected loadUsers(): void {
    this.loading.set(true);
    this.error.set('');
    this.admin.getUsers().pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (users) => this.users.set(users),
      error: () => this.error.set(this.apiError.message() || 'People could not be loaded. Please try again.'),
    });
  }

  protected changeRole(user: AdminUser, event: Event): void {
    const select = event.currentTarget as HTMLSelectElement;
    const role = select.value;
    if (user.id === this.currentUserId || (role !== UserRole.ADMIN && role !== UserRole.MEMBER) || user.role === role) {
      return;
    }
    this.savingUserId.set(user.id);
    this.error.set('');
    this.notice.set('');
    this.admin.updateUserRole(user.id, role).pipe(
      finalize(() => this.savingUserId.set('')),
    ).subscribe({
      next: (updated) => {
        this.users.update((users) => users.map((entry) => entry.id === updated.id ? updated : entry));
        this.notice.set(`${updated.name} is now ${updated.role === UserRole.ADMIN ? 'an admin' : 'a member'}.`);
      },
      error: () => {
        select.value = user.role;
        this.error.set(this.apiError.message() || 'That role could not be saved. Please try again.');
      },
    });
  }

  protected canDeleteUser(user: AdminUser): boolean {
    if (user.id === this.currentUserId) return false;
    return user.role !== UserRole.ADMIN ||
      this.users().filter(({ role }) => role === UserRole.ADMIN).length > 1;
  }

  protected deleteUser(user: AdminUser): void {
    if (!this.canDeleteUser(user) || this.savingUserId() === user.id || this.deletingUserId() === user.id) {
      return;
    }
    const confirmed = globalThis.confirm(
      `Delete ${user.name}? Their pot-lucks and dishes will remain, but their account, uploaded photos, sign-in sessions, and RSVPs will be removed. Organizer and dish-owner links will be cleared. This cannot be undone.`,
    );
    if (!confirmed) return;

    this.deletingUserId.set(user.id);
    this.error.set('');
    this.notice.set('');
    this.admin.deleteUser(user.id).pipe(
      finalize(() => this.deletingUserId.set('')),
    ).subscribe({
      next: (deleted) => {
        this.users.update((users) => users.filter((entry) => entry.id !== deleted.id));
        this.notice.set(`${deleted.name} was deleted.`);
      },
      error: () => this.error.set(this.apiError.message() || 'That account could not be deleted. Please try again.'),
    });
  }
}
