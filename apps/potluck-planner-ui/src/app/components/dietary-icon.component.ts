import { Component, computed, input } from '@angular/core';
import { DishSuitability } from '../models/dish-suitability.model';

@Component({
  selector: 'dietary-icon',
  standalone: true,
  template: `<span class="icon" [style.mask-image]="source()" aria-hidden="true"></span>`,
  styles: `
    :host { display: inline-flex; flex-shrink: 0; }
    .icon {
      display: block;
      width: var(--dietary-icon-size, 1.5rem);
      height: var(--dietary-icon-size, 1.5rem);
      background-color: var(--dietary-icon-color, #d9b98b);
      mask-size: contain;
      mask-repeat: no-repeat;
      mask-position: center;
      transition: background-color var(--transition-fast);
    }

    @media (prefers-reduced-motion: reduce) {
      .icon { transition-duration: 1ms; }
    }
  `,
})
export class DietaryIconComponent {
  readonly preference = input.required<DishSuitability>();
  protected readonly source = computed(() =>
    `url("/images/dietary/${this.preference().toLowerCase()}.svg")`,
  );
}
