import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { DishDetails } from '../models/dish-details.model';
import { Dish } from '../models/dish.model';
import { PotLuckItem } from '../models/pot-luck-item.model';
import { RsvpStatus } from '../models/rsvp-status.model';
import { PotlucksService } from '../services/potlucks.service';
import { SessionService } from '../services/session.service';
import { DishFormComponent } from './dish-form.component';
import { DishCardComponent } from './dish-card.component';
import { PotButtonComponent } from './pot-button.component';
import { PotChipComponent } from './pot-chip.component';
import { PotIconComponent } from './pot-icon.component';
import { SmoothHeightDirective } from './smooth-height.directive';

@Component({
  selector: 'pot-pot-luck-details',
  template: `
      @if (potLuck(); as currentPotLuck) {
        <div class="flex flex-col" animate.enter="fade-in" animate.leave="fade-out">
        <a class="inline-flex gap-1.5 text-muted-foreground hover" routerLink="/">
          <pot-icon name="arrow_back" />
          <span>
            All pot-lucks
          </span>
        </a>

        <header>
          <pot-chip>
            <pot-icon name="calendar_month" />
            <span class="uppercase">{{ currentPotLuck.date }}</span>
          </pot-chip>
          <h1>{{ currentPotLuck.title }}</h1>
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-1.5">
              <pot-icon name="schedule" style="rounded" size="lg" color="primary" />
              Starts at <time [attr.datetime]="currentPotLuck.startTime">{{ currentPotLuck.startTime }}</time>
            </div>
            <div class="flex items-center gap-1.5">
              <pot-icon name="pin_drop" style="rounded" size="lg" color="primary" />
              {{ currentPotLuck.location }}
            </div>
            <div class="flex items-center gap-1.5">
              <pot-icon name="group" style="rounded" size="lg" color="primary" />
              Organised by {{ currentPotLuck.organiser }}
            </div>
            <div class="flex items-center gap-1.5">
              <pot-icon name="check" style="rounded" size="lg" color="primary" />
              {{ currentPotLuck.attendanceLabel }}
            </div>
          </div>
          <p class="text-muted-foreground">{{ currentPotLuck.description }}</p>
          @if (canDeletePotLuck()) {
            <div class="event-actions">
              <pot-button
                variant="danger"
                size="sm"
                [disabled]="deletingPotLuck()"
                (click)="deletePotLuck(currentPotLuck)"
              >
                {{ deletingPotLuck() ? 'Deleting…' : 'Delete pot-luck' }}
              </pot-button>
            </div>
            @if (deleteError()) {
              <p class="delete-error" role="alert">{{ deleteError() }}</p>
            }
          }
        </header>

        @if (currentPotLuck.imageUrl) {
          <img class="event-photo mt-10" [src]="currentPotLuck.imageUrl" [alt]="currentPotLuck.imageAlt ?? currentPotLuck.title"
            animate.enter="fade-in" animate.leave="fade-out" />
        }

        <div class="card rsvp p-5">
          <h2>Will you be there?</h2>
          <p class="text-muted-foreground">
            Let everyone know - and tell us what you're bringing.
          </p>
        
          @if (signedIn()) {
          @let rsvpStatus = currentPotLuck.rsvpStatus;
          <div class="flex gap-2">
            <pot-button
              [variant]="rsvpStatus === RsvpStatus.ATTENDING ? 'success' : undefined"
              size="sm"
              (click)="setRsvp(RsvpStatus.ATTENDING)"
            >
              <pot-icon name="check" />
              I'm in
            </pot-button>

            <pot-button
              [variant]="rsvpStatus === RsvpStatus.MAYBE ? 'warning' : undefined"
              size="sm"
              (click)="setRsvp(RsvpStatus.MAYBE)"
            >
              <pot-icon name="help" />
              Maybe
            </pot-button>

            <pot-button
              [variant]="rsvpStatus === RsvpStatus.NOT_GOING ? 'danger' : undefined"
              size="sm"
              (click)="setRsvp(RsvpStatus.NOT_GOING)"
            >
              <pot-icon name="cancel" />
              Can't make it
            </pot-button>
          </div>
          } @else {
            <p animate.enter="fade-in" animate.leave="fade-out"><a routerLink="/login">Log in</a> or <a routerLink="/register">create an account</a> to RSVP and bring a dish.</p>
          }
        </div>

        @if (canAddDish()) {
          <div class="reveal" animate.enter="reveal-in" animate.leave="reveal-out">
            <div class="reveal-content">
              <section class="contribution">
                @let dishFormVisible = canAddDish() && showDishForm();
                <div class="flex items-center justify-between">
                  <h2 class="flex gap-2">
                    <pot-icon name="chef_hat" color="primary" size="2xl" />
                    What I'm bringing
                  </h2>

                  @if (!showDishForm()) {
                    <pot-button animate.enter="fade-in" animate.leave="fade-out" variant="primary" size="sm" (click)="openDishForm()">
                      <pot-icon name="add" />
                      Add a dish
                    </pot-button>
                  }
                </div>

                <div smoothHeight>
                  <div class="dish-content">
                  @if (dishFormVisible) {
                    <dish-form class="dish-branch" animate.enter="fade-in" animate.leave="fade-out" [dish]="editingDish()" [saving]="savingDish()" [saveError]="dishSaveError()" (submitted)="onDishSubmitted($event)" (cancelled)="showDishForm.set(false)" />
                  } @else {
                    <div class="dish-branch grid gap-4 grid-cols-3 dish-grid" animate.enter="fade-in" animate.leave="fade-out">
                      @for (dish of myDishes(); track dish.id) {
                        <dish-card [dish]="dish" [editable]="true" (editRequested)="openDishForm($event)" />
                      } @empty {
                        <p class="text-muted-foreground">
                          You haven't added a dish yet. Bringing something is optional - but the foodies love it.
                        </p>
                      }
                    </div>
                  }
                  </div>
                </div>
              </section>
            </div>
          </div>
        }

        <section class="attendees">
          <div class="flex items-center justify-between">
            <h2 class="flex gap-2">
              <pot-icon name="group" color="primary" size="2xl" />
              Who's coming
            </h2>
          </div>

          <div class="grid gap-4 grid-cols-3">
            @for (attendee of currentPotLuck.attendees ?? []; track attendee.id) {
              <p class="text-muted-foreground">
                {{ attendee.name }} -
                {{ attendee.status === RsvpStatus.ATTENDING ? "I'm in" : 'Maybe' }}
              </p>
            } @empty {
            <p class="text-muted-foreground">
              No responses yet - be the first to RSVP!
            </p>
            }
          </div>
        </section>

        <section class="menu" id="full-spread">
          <div class="flex items-center justify-between">
            <h2 class="flex gap-2">
              <pot-icon name="chef_hat" color="primary" size="2xl" />
              The full spread
            </h2>
          </div>

          <div class="grid gap-4 grid-cols-3 dish-grid">
            @for (dish of currentPotLuck.dishes; track dish.id) {
              <dish-card animate.enter="fade-in" animate.leave="fade-out" [dish]="dish" />
            } @empty {
              <p class="text-muted-foreground" animate.enter="fade-in" animate.leave="fade-out">
                No dishes on the menu yet - be the first to add something.
              </p>
            }
          </div>
        </section>
        </div>
      } @else {
        <p class="text-muted-foreground" animate.enter="fade-in" animate.leave="fade-out">Loading pot-luck details...</p>
      }
  `,
  styles: `
    .event-photo {
      width: 100%;
      height: 20rem;
      object-fit: cover;
      border-radius: var(--border-radius-md);
    }

    .event-actions {
      margin-top: 1rem;
    }

    .delete-error {
      margin-top: 0.5rem;
      color: var(--color-error);
    }

    .dish-content {
      position: relative;
      display: flow-root;
    }

    dish-form.dish-branch {
      display: block;
    }

    .dish-branch.fade-out {
      position: absolute;
      inset: 0 0 auto;
    }

    .dish-grid {
      grid-auto-rows: 1fr;
    }

    header {
      margin-top: 2rem;

      > :not(:first-child) {
        margin-top: 0.75rem;
      }
    }

    .card.rsvp {
      margin-top: 2rem;

      h2 {
        margin-bottom: 0.25rem;
      }

      p {
        margin-bottom: 1rem;
      }
    }

    section {
      margin-top: 2rem;

      > div:last-child {
        margin-top: 1rem;
      }
    }
  `,
  imports: [PotIconComponent, RouterLink, PotChipComponent, PotButtonComponent, DishFormComponent, DishCardComponent, SmoothHeightDirective],
})
export class PotLuckDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly potlucks = inject(PotlucksService);
  private readonly session = inject(SessionService);
  protected readonly signedIn = this.session.signedIn;
  protected readonly deletingPotLuck = signal(false);
  protected readonly deleteError = signal('');

  protected readonly RsvpStatus = RsvpStatus;
  protected readonly showDishForm = signal(false);
  protected readonly editingDish = signal<Dish | null>(null);
  protected readonly savingDish = signal(false);
  protected readonly dishSaveError = signal('');

  readonly routeParamMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly potLuck = computed<PotLuckItem | null>(() => {
    const routeId = this.routeParamMap().get('id');

    if (!routeId) {
      return this.potlucks.featuredPotLuck();
    }

    return this.potlucks.getById(routeId) ?? this.potlucks.featuredPotLuck();
  });

  protected readonly myDishes = computed(() =>
    (this.potLuck()?.dishes ?? []).filter(
      (dish) => dish.broughtByUserId === this.session.currentUser().id,
    ),
  );

  protected readonly canAddDish = computed(() => {
    if (!this.session.signedIn()) return false;
    const status = this.potLuck()?.rsvpStatus;
    return status === RsvpStatus.ATTENDING || status === RsvpStatus.MAYBE;
  });

  protected readonly canDeletePotLuck = computed(() => {
    const potLuck = this.potLuck();
    const user = this.session.currentUser();
    return this.session.signedIn() &&
      !!potLuck &&
      (potLuck.organiserUserId === user.id || this.session.isAdmin());
  });

  protected deletePotLuck(potLuck: PotLuckItem): void {
    if (this.deletingPotLuck() || !this.canDeletePotLuck()) return;
    if (!window.confirm(`Delete "${potLuck.title}"? This will remove the pot-luck and its RSVPs and dishes.`)) return;
    this.deletingPotLuck.set(true);
    this.deleteError.set('');
    this.potlucks.delete(potLuck.id).pipe(
      switchMap(() => this.router.navigateByUrl('/')),
      finalize(() => this.deletingPotLuck.set(false)),
    ).subscribe({
      error: () => this.deleteError.set('The pot-luck could not be deleted. Please try again.'),
    });
  }

  setRsvp(status: RsvpStatus): void {
    const currentPotLuck = this.potLuck();

    if (!currentPotLuck) {
      return;
    }

    this.potlucks.saveRsvp(currentPotLuck.id, status).subscribe(() => {
      if (status === RsvpStatus.NOT_GOING) {
        this.showDishForm.set(false);
      }
    });
  }

  protected openDishForm(dish: Dish | null = null): void {
    this.editingDish.set(dish);
    this.dishSaveError.set('');
    this.showDishForm.set(true);
  }

  onDishSubmitted(dish: DishDetails): void {
    const currentPotLuck = this.potLuck();

    if (!currentPotLuck || this.savingDish()) {
      return;
    }

    this.savingDish.set(true);
    this.dishSaveError.set('');
    const editingDish = this.editingDish();
    const save$ = editingDish
      ? this.potlucks.updateDish(currentPotLuck.id, editingDish.id, dish)
      : this.potlucks.addDish(currentPotLuck.id, dish);
    save$.pipe(finalize(() => this.savingDish.set(false))).subscribe({
      next: () => this.showDishForm.set(false),
      error: () => this.dishSaveError.set('The dish could not be saved. Please try again.'),
    });
  }
}
