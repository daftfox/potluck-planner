import { Component, computed, inject, input, output } from '@angular/core';
import { Dish } from '../models/dish.model';
import { SessionService } from '../services/session.service';
import { PotIconComponent } from './pot-icon.component';
import { DietaryIconComponent } from './dietary-icon.component';

@Component({
  selector: 'dish-card',
  standalone: true,
  imports: [PotIconComponent, DietaryIconComponent],
  template: `
    <article class="card flex flex-col gap-3 p-4">
      @if (editable()) {
        <div class="edit-control" animate.enter="fade-in" animate.leave="fade-out">
          <button
            type="button"
            class="edit-button"
            [attr.aria-label]="'Edit ' + dish().name"
            (click)="editRequested.emit(dish())"
          >
            <pot-icon name="edit" />
          </button>
        </div>
      }
      <img
        [src]="dish().photoUrl || '/images/dish-placeholder.svg'"
        [alt]="dish().photoUrl ? dish().name : ''"
        class="thumbnail"
      />

      <div>
        <h3 class="text-lg font-semibold">{{ dish().name }}</h3>
        @if (dish().description) {
          <p class="text-muted-foreground" animate.enter="fade-in" animate.leave="fade-out">{{ dish().description }}</p>
        }
      </div>

      @if (dish().prepNotes) {
        <p class="text-sm text-muted-foreground" animate.enter="fade-in" animate.leave="fade-out">{{ dish().prepNotes }}</p>
      }
      @if (dish().suitableFor?.length) {
        <footer class="dietary-footer" aria-label="Declared dietary suitability" animate.enter="fade-in" animate.leave="fade-out">
          @for (suitability of dish().suitableFor; track suitability) {
            @let matchesPreference = preferences().includes(suitability);
            <span
              class="dietary-badge"
              [class.matches-preference]="matchesPreference"
              [attr.aria-label]="suitability + (matchesPreference ? ' - matches your dietary preferences' : '')"
              role="img"
              tabindex="0"
              (pointerenter)="positionTooltip($event)"
              (pointermove)="positionTooltip($event)"
              (focus)="positionTooltip($event)"
            >
              <dietary-icon [preference]="suitability" />
              <span class="dietary-tooltip" role="tooltip" aria-hidden="true">{{ suitability }}{{ matchesPreference ? ' - matches your dietary preferences' : '' }}</span>
            </span>
          }
        </footer>
      }
    </article>
  `,
  styles: `
    :host {
      display: flex;
      min-width: 0;
    }

    article {
      position: relative;
      flex: 1;
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .edit-control {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      z-index: 1;
    }

    .dietary-footer {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: auto;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-border);
    }

    .dietary-badge {
      --dietary-icon-size: 1rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.375rem;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-pill);
    }

    .dietary-badge:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .dietary-badge.matches-preference {
      --dietary-icon-color: var(--color-text-on-light);
      background-color: var(--color-success);
      border-color: var(--color-success);
    }

    .dietary-tooltip {
      position: fixed;
      top: var(--tooltip-y, 0px);
      left: var(--tooltip-x, 0px);
      z-index: var(--z-tooltip, 4000);
      width: max-content;
      max-width: calc(100vw - 16px);
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      background: var(--color-surface);
      color: var(--color-text);
      box-shadow: var(--shadow-sm);
      font-size: var(--font-size-sm);
      line-height: var(--line-height-sm);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity var(--transition-fast), visibility var(--transition-fast);
    }

    .dietary-badge:hover .dietary-tooltip,
    .dietary-badge:focus .dietary-tooltip {
      opacity: 1;
      visibility: visible;
    }

    .edit-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border: 1px solid var(--color-border);
      border-radius: 50%;
      background: var(--color-surface);
      color: var(--color-primary);
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--transition-fast);
    }

    article:hover .edit-button {
      opacity: 1;
      pointer-events: auto;
    }

    .edit-button:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .edit-button,
      .dietary-tooltip {
        transition-duration: 1ms;
      }
    }

    .thumbnail {
      width: 100%;
      height: 10rem;
      object-fit: cover;
      border-radius: var(--border-radius-sm);
    }
  `,
})
export class DishCardComponent {
  private readonly session = inject(SessionService);
  protected readonly preferences = computed(() =>
    this.session.signedIn() ? this.session.currentUser().dietaryPreferences : [],
  );
  readonly dish = input.required<Dish>();
  readonly editable = input(false);
  readonly editRequested = output<Dish>();

  protected positionTooltip(event: Event): void {
    const badge = event.currentTarget;
    if (!(badge instanceof HTMLElement)) return;
    const tooltip = badge.querySelector<HTMLElement>('.dietary-tooltip');
    if (!tooltip) return;

    const bounds = badge.getBoundingClientRect();
    const x = event instanceof PointerEvent ? event.clientX : bounds.right;
    const y = event instanceof PointerEvent ? event.clientY : bounds.bottom;
    const { width, height } = tooltip.getBoundingClientRect();
    const viewport = badge.ownerDocument.documentElement;
    const left = Math.max(8, Math.min(x + 12, viewport.clientWidth - width - 8));
    const top = Math.max(8, y + height + 12 > viewport.clientHeight - 8
      ? y - height - 12
      : y + 12);
    badge.style.setProperty('--tooltip-x', `${left}px`);
    badge.style.setProperty('--tooltip-y', `${top}px`);
  }
}
