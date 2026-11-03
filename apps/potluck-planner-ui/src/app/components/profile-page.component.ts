import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { DishSuitability } from '../models/dish-suitability.model';
import { RsvpStatus } from '../models/rsvp-status.model';
import { PotlucksService } from '../services/potlucks.service';
import { ProfileService } from '../services/profile.service';
import { SessionService } from '../services/session.service';
import { DishCardComponent } from './dish-card.component';
import { PotButtonComponent } from './pot-button.component';
import { PotIconComponent } from './pot-icon.component';
import { SmoothHeightDirective } from './smooth-height.directive';
import { DietarySelectorComponent } from './dietary-selector.component';

@Component({
  selector: 'pot-profile-page',
  standalone: true,
  imports: [FormsModule, RouterLink, DishCardComponent, PotButtonComponent, PotIconComponent, SmoothHeightDirective, DietarySelectorComponent],
  template: `
    <div class="profile-page" animate.enter="fade-in" animate.leave="fade-out">
      <header>
        <h1>Your profile</h1>
        <p class="text-muted-foreground">Your preferences, plans, and dishes shared around the table.</p>
      </header>

      <section class="card p-5" aria-labelledby="profile-details">
        <h2 id="profile-details">Profile details</h2>
        <form (ngSubmit)="saveProfile()">
          <fieldset [disabled]="saving()" class="profile-fields">
            <div>
              <label for="profile-username">Username</label>
              <input id="profile-username" name="username" autocomplete="username" readonly
                [value]="username() ?? ''" aria-describedby="profile-username-help" />
              <p id="profile-username-help" class="text-sm text-muted-foreground">Your login username cannot be changed. Your display name can be changed below.</p>
            </div>
            <div>
              <label for="profile-name">Display name</label>
              <input
                #nameInput
                id="profile-name"
                name="displayName"
                autocomplete="nickname"
                required
                maxlength="80"
                [value]="draft().name"
                (input)="updateName(nameInput.value)"
              />
            </div>
            <dietary-selector
              label="Dietary preferences"
              [selected]="draft().dietaryPreferences"
              [disabled]="saving()"
              (selectedChange)="updatePreferences($event)"
            />
            <div smoothHeight aria-live="polite">
              <div>
                @if (error()) {
                  <p class="error" role="alert" animate.enter="fade-in" animate.leave="fade-out">{{ error() }}</p>
                }
                @if (saved()) {
                  <p role="status" animate.enter="fade-in" animate.leave="fade-out">Profile updated.</p>
                }
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <pot-button type="button" variant="secondary" size="sm" [disabled]="saving()" (click)="resetDraft()">Cancel changes</pot-button>
              <pot-button type="submit" variant="primary" size="sm" [disabled]="saving()">
                {{ saving() ? 'Saving...' : 'Save profile' }}
              </pot-button>
            </div>
          </fieldset>
        </form>
      </section>

      <section aria-labelledby="profile-rsvps">
        <h2 id="profile-rsvps">Your pot-luck RSVPs</h2>
        <div class="overview-grid">
          @for (potLuck of rsvpedPotLucks(); track potLuck.id) {
            <article class="card p-4" animate.enter="fade-in" animate.leave="fade-out">
              <h3><a [routerLink]="['/details', potLuck.id]">{{ potLuck.title }}</a></h3>
              <p>{{ potLuck.date }} at {{ potLuck.startTime }}</p>
              <p class="text-muted-foreground">{{ potLuck.location }}</p>
              <p class="rsvp-status">
                <pot-icon [name]="potLuck.rsvpStatus === RsvpStatus.ATTENDING ? 'check' : potLuck.rsvpStatus === RsvpStatus.MAYBE ? 'help' : 'cancel'" />
                {{ rsvpLabels[potLuck.rsvpStatus] }}
              </p>
            </article>
          } @empty {
            <p class="text-muted-foreground" animate.enter="fade-in" animate.leave="fade-out">
              You haven't RSVP'd to any pot-lucks yet. <a routerLink="/">Find a pot-luck</a> to join.
            </p>
          }
        </div>
      </section>

      <section aria-labelledby="profile-dishes">
        <h2 id="profile-dishes">Dishes you've brought</h2>
        <p class="text-muted-foreground">Your contributions to pot-lucks before today.</p>
        <div class="overview-grid">
          @for (entry of pastDishes(); track entry.potLuck.id + ':' + entry.dish.id) {
            <div class="history-entry" animate.enter="fade-in" animate.leave="fade-out">
              <p>
                <a [routerLink]="['/details', entry.potLuck.id]">{{ entry.potLuck.title }}</a>
                <span class="text-sm text-muted-foreground"> - {{ entry.potLuck.date }} at {{ entry.potLuck.startTime }}</span>
              </p>
              <dish-card [dish]="entry.dish" />
            </div>
          } @empty {
            <p class="text-muted-foreground" animate.enter="fade-in" animate.leave="fade-out">
              No past dishes yet. Your contributions will appear here after the pot-luck date.
            </p>
          }
        </div>
      </section>
    </div>
  `,
  styles: `
    .profile-page, .profile-fields {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    fieldset {
      min-width: 0;
      padding: 0;
      margin: 1rem 0;
      border: 0;
    }
    label { display: block; margin-bottom: 0.25rem; }
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .history-entry { display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; }
    .history-entry dish-card { flex: 1; }
    .rsvp-status { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; }
    .error { color: var(--color-error); }
    a { color: var(--color-primary); }
  `,
})
export class ProfilePageComponent {
  private readonly session = inject(SessionService);
  private readonly potlucks = inject(PotlucksService);
  private readonly profile = inject(ProfileService);
  protected readonly username = computed(() => this.session.currentUser().username);
  protected readonly RsvpStatus = RsvpStatus;
  protected readonly rsvpLabels: Record<RsvpStatus, string> = {
    [RsvpStatus.ATTENDING]: "I'm in",
    [RsvpStatus.MAYBE]: 'Maybe',
    [RsvpStatus.NOT_GOING]: "Can't make it",
  };
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly error = signal('');
  protected readonly draft = linkedSignal(() => ({
    name: this.session.currentUser().name,
    dietaryPreferences: [...this.session.currentUser().dietaryPreferences],
  }));
  protected readonly rsvpedPotLucks = this.potlucks.rsvpedPotLucks;
  private readonly today = new Date();
  private readonly todayKey = [
    this.today.getFullYear(),
    String(this.today.getMonth() + 1).padStart(2, '0'),
    String(this.today.getDate()).padStart(2, '0'),
  ].join('-');
  protected readonly pastDishes = computed(() =>
    this.potlucks.allPotLucks()
      .filter((potLuck) => potLuck.startsOn < this.todayKey)
      .sort((a, b) => b.startsOn.localeCompare(a.startsOn))
      .flatMap((potLuck) => (potLuck.dishes ?? [])
        .filter((dish) => dish.broughtByUserId === this.session.currentUser().id)
        .map((dish) => ({ dish, potLuck }))),
  );

  protected updateName(name: string): void {
    this.saved.set(false);
    this.error.set('');
    this.draft.update((draft) => ({ ...draft, name }));
  }

  protected updatePreferences(dietaryPreferences: DishSuitability[]): void {
    this.saved.set(false);
    this.error.set('');
    this.draft.update((draft) => ({
      ...draft,
      dietaryPreferences,
    }));
  }

  protected resetDraft(): void {
    const user = this.session.currentUser();
    this.draft.set({ name: user.name, dietaryPreferences: [...user.dietaryPreferences] });
    this.saved.set(false);
    this.error.set('');
  }

  protected saveProfile(): void {
    if (this.saving()) return;
    this.saved.set(false);
    this.error.set('');
    if (!this.draft().name.trim()) {
      this.error.set('Display name is required.');
      return;
    }
    this.saving.set(true);
    const { name, dietaryPreferences } = this.draft();
    this.profile.update(name, dietaryPreferences).pipe(
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: () => this.saved.set(true),
      error: () => this.error.set('Your profile could not be saved. Please try again.'),
    });
  }
}
