import { Component, input } from '@angular/core';
import { PotLuckItem } from '../models/pot-luck-item.model';
import { PotIconComponent } from './pot-icon.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'pot-upcoming-pot-luck-item',
  standalone: true,
  imports: [PotIconComponent, RouterLink],
  template: `
    <a class="card flex flex-col gap-3 p-5 shadow-primary border-primary" [routerLink]="['details', potLuck().id]">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
            <pot-icon name="calendar_month" style="rounded" size="md" color="primary"></pot-icon>
            {{ potLuck().date }}
          </p>
        </div>
      </div>
      <h3 class="mt-1.5 font-display text-lg font-semibold leading-snug group-hover:text-primary">
        {{ potLuck().title }}
      </h3>
      <p class="flex items-center text-sm gap-2 text-muted-foreground">
        <pot-icon name="schedule" style="rounded" size="md" color="primary" />
        Starts at <time [attr.datetime]="potLuck().startTime">{{ potLuck().startTime }}</time>
      </p>
      <p class="flex items-center text-sm gap-2 text-muted-foreground">
        <pot-icon name="pin_drop" style="rounded" size="md" color="primary"></pot-icon>
        {{ potLuck().location }}
      </p>
      <p class="flex items-center text-sm gap-2 text-muted-foreground">
        <pot-icon name="group" style="rounded" size="md" color="primary"></pot-icon>
        {{ potLuck().attendanceLabel }}
      </p>
    </a>
  `,
})
export class PotUpcomingPotLuckItemComponent {
  readonly potLuck = input.required<PotLuckItem>();
}
