import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { PotLuckItem } from '../models/pot-luck-item.model';
import { PotUpcomingPotLuckItemComponent } from './pot-upcoming-pot-luck-item.component';

@Component({
  selector: 'pot-upcoming-pot-lucks',
  standalone: true,
  imports: [CommonModule, PotUpcomingPotLuckItemComponent],
  template: `
    <section class="mt-10">
      <h2 class="mb-4">Upcoming Pot-lucks</h2>
      <div class="grid gap-4 grid-cols-3">
        @for (potLuck of potLucks(); track potLuck.id) {
          <pot-upcoming-pot-luck-item [potLuck]="potLuck"></pot-upcoming-pot-luck-item>
        }
      </div>
    </section>
  `,
})
export class PotUpcomingPotLucksComponent {
  readonly potLucks = input<PotLuckItem[]>([]);
}
