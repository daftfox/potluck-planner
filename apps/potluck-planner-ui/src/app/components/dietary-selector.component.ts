import { Component, computed, input, output } from '@angular/core';
import { DishSuitability } from '../models/dish-suitability.model';
import { DietaryIconComponent } from './dietary-icon.component';

@Component({
  selector: 'dietary-selector',
  standalone: true,
  imports: [DietaryIconComponent],
  styles: `
    .button.success,
    .button.secondary:hover:not(:disabled) {
      --dietary-icon-color: var(--color-text-on-light);
    }

    .button.secondary:disabled {
      background-color: transparent;
      border-color: var(--color-border);
      color: var(--color-text);
    }

    .button.success:disabled {
      background-color: var(--color-success);
    }
  `,
  template: `
    <p class="mb-2 text-sm font-medium">{{ label() }}</p>
    <div class="flex flex-wrap gap-2" role="group" [attr.aria-label]="label()">
      @for (option of options; track option) {
        <button
          type="button"
          class="button sm"
          [class.success]="selected().includes(option)"
          [class.secondary]="!selected().includes(option)"
          [attr.aria-pressed]="selected().includes(option)"
          [disabled]="disabled() || disabledReasons().has(option)"
          [attr.title]="disabledReasons().get(option) ?? null"
          [attr.aria-description]="disabledReasons().get(option) ?? null"
          (click)="toggle(option)"
        >
          <dietary-icon [preference]="option" />
          {{ option }}
        </button>
      }
    </div>
    @if (disabledReasons().size) {
      <p class="mt-2 text-sm text-muted-foreground" animate.enter="fade-in" animate.leave="fade-out">
        Some options are disabled by your {{ selected().includes(vegan) ? 'Vegan' : 'Vegetarian' }} selection.
        Existing selections are kept; deselect it to change them.
      </p>
    }
  `,
})
export class DietarySelectorComponent {
  readonly label = input('Suitable for');
  readonly selected = input<DishSuitability[]>([]);
  readonly disabled = input(false);
  readonly selectedChange = output<DishSuitability[]>();
  protected readonly options = Object.values(DishSuitability).sort((a, b) => a.localeCompare(b));
  protected readonly vegan = DishSuitability.VEGAN;
  protected readonly disabledReasons = computed(() => {
    const reasons = new Map<DishSuitability, string>();
    if (this.selected().includes(DishSuitability.VEGAN) && !this.selected().includes(DishSuitability.VEGETARIAN)) {
      reasons.set(DishSuitability.VEGETARIAN, 'Disabled while Vegan is selected. Deselect Vegan to select Vegetarian.');
    }
    if (this.selected().includes(DishSuitability.VEGETARIAN) && !this.selected().includes(DishSuitability.VEGAN)) {
      reasons.set(DishSuitability.VEGAN, 'Disabled while Vegetarian is selected. Deselect Vegetarian to select Vegan.');
    }
    if (this.selected().includes(DishSuitability.VEGAN)) {
      for (const option of [
        DishSuitability.DAIRY_FREE,
        DishSuitability.EGG_FREE,
        DishSuitability.PESCATARIAN,
        DishSuitability.SHELLFISH_FREE,
      ]) {
        reasons.set(option, 'Disabled while Vegan is selected. Deselect Vegan to change this option.');
      }
    } else if (this.selected().includes(DishSuitability.VEGETARIAN)) {
      for (const option of [DishSuitability.PESCATARIAN, DishSuitability.SHELLFISH_FREE]) {
        reasons.set(option, 'Disabled while Vegetarian is selected. Deselect Vegetarian to change this option.');
      }
    }
    return reasons;
  });

  protected toggle(option: DishSuitability): void {
    if (this.disabled() || this.disabledReasons().has(option)) return;
    this.selectedChange.emit(
      this.selected().includes(option)
        ? this.selected().filter((item) => item !== option)
        : [...this.selected(), option],
    );
  }
}
