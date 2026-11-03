import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'pot-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="chip" [class.primary]="variant() === 'primary'">
      <ng-content></ng-content>
    </span>
  `,
})
export class PotChipComponent {
  readonly variant = input<'primary' | 'default'>('primary');
}
