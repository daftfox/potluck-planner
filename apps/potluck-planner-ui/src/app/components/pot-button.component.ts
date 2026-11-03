import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'pot-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      class="button"
      [class.round]="round()"
      [class.primary]="variant() === 'primary'"
      [class.secondary]="variant() === 'secondary'"
      [class.success]="variant() === 'success'"
      [class.warning]="variant() === 'warning'"
      [class.danger]="variant() === 'danger'"
      [class.sm]="size() === 'sm'"
      [class.md]="size() === 'md'"
      [class.lg]="size() === 'lg'"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class PotButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'success' | 'warning' | 'danger'>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly round = input(false);
  readonly disabled = input(false);
}
