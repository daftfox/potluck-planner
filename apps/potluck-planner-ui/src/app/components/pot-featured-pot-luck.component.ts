import { Component, input } from '@angular/core';
import { PotButtonComponent } from './pot-button.component';
import { PotChipComponent } from './pot-chip.component';
import { PotIconComponent } from './pot-icon.component';
import { PotLuckItem } from '../models/pot-luck-item.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'pot-featured-pot-luck',
  standalone: true,
  imports: [PotButtonComponent, PotChipComponent, PotIconComponent, RouterLink],
  template: `
    <section class="card">
      <div class="grid grid-cols-2" style="height: 75vh;">
        <div class="flex flex-col justify-center gap-4 p-8">
          <pot-chip>
            <pot-icon name="calendar_month" style="rounded" size="sm" color="primary" />
            <span class="uppercase">Next pot-luck</span>
          </pot-chip>
          <h1>{{ potLuck().title }}</h1>
          <div class="text-foreground">
            <p class="flex items-center gap-2">
              <pot-icon name="calendar_month" style="rounded" size="lg" color="primary" />
              {{ potLuck().date }}
            </p>
            <p class="flex items-center gap-2">
              <pot-icon name="schedule" style="rounded" size="lg" color="primary" />
              Starts at <time [attr.datetime]="potLuck().startTime">{{ potLuck().startTime }}</time>
            </p>
            <p class="flex items-center gap-2">
              <pot-icon name="pin_drop" style="rounded" size="lg" color="primary" />
              {{ potLuck().location }}
            </p>
            <p class="flex items-center gap-2">
              <pot-icon name="group" style="rounded" size="lg" color="primary" />
              {{ potLuck().attendanceLabel }}
            </p>
          </div>
          <p class="text-muted-foreground">
            {{ potLuck().description }}
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <pot-button variant="primary" [routerLink]="['/details', potLuck().id]">
              RSVP now
              <pot-icon name="arrow_forward" style="rounded" size="sm" color="inherit" />
            </pot-button>
            <pot-button variant="secondary" [routerLink]="['/details', potLuck().id]" fragment="full-spread">
              See what's cooking
            </pot-button>
          </div>
        </div>

        <div class="min-h-[260px] overflow-hidden">
          <img [src]="potLuck().imageUrl" [alt]="potLuck().imageAlt ?? potLuck().title" class="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  `,
})
export class PotFeaturedPotLuckComponent {
  readonly potLuck = input.required<PotLuckItem>();
}
