import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { PotlucksService } from '../services/potlucks.service';
import { FileDropperComponent } from './file-dropper.component';
import { PotButtonComponent } from './pot-button.component';
import { SmoothHeightDirective } from './smooth-height.directive';

@Component({
  selector: 'pot-create-pot-luck-page',
  standalone: true,
  imports: [FormsModule, FileDropperComponent, PotButtonComponent, SmoothHeightDirective],
  template: `
    <section class="event-page" animate.enter="fade-in" animate.leave="fade-out">
      <header>
        <h1>Organise a pot-luck</h1>
        <p class="text-muted-foreground">Bring everyone together around a shared table.</p>
      </header>
      <form class="card p-5" (ngSubmit)="submit()">
        <fieldset [disabled]="saving()">
          <div>
            <label for="event-title">Event title</label>
            <input id="event-title" name="title" required placeholder="e.g. Friday team lunch"
              [ngModel]="title()" (ngModelChange)="title.set($event)" />
          </div>
          <div class="date-time">
            <div>
              <label for="event-date">Date</label>
              <input id="event-date" name="date" type="date" required
                [ngModel]="date()" (ngModelChange)="date.set($event)" />
            </div>
            <div>
              <label for="event-time">Time</label>
              <input id="event-time" name="time" type="time" required
                [ngModel]="time()" (ngModelChange)="time.set($event)" />
            </div>
          </div>
          <div>
            <label for="event-location">Location</label>
            <input id="event-location" name="location" required placeholder="Where are we gathering?"
              [ngModel]="location()" (ngModelChange)="location.set($event)" />
          </div>
          <div>
            <label for="event-description">Description (optional)</label>
            <textarea id="event-description" name="description" rows="4" placeholder="Tell your guests what to expect"
              [ngModel]="description()" (ngModelChange)="description.set($event)"></textarea>
          </div>
          <div>
            <p class="mb-1">Event photo (optional)</p>
            <file-dropper label="Choose an event photo or drop an image here"
              [file]="photo()" [disabled]="saving()" (fileChanged)="photo.set($event)" />
          </div>
          <div smoothHeight aria-live="polite">
            <div>
              @if (error()) {
                <p class="error" role="alert" animate.enter="fade-in" animate.leave="fade-out">{{ error() }}</p>
              }
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <pot-button variant="secondary" [disabled]="saving()" (click)="cancel()">Cancel</pot-button>
            <pot-button type="submit" variant="primary" [disabled]="saving()">
              {{ saving() ? 'Creating...' : 'Create pot-luck' }}
            </pot-button>
          </div>
        </fieldset>
        <p class="text-sm text-muted-foreground">Your pot-luck and photo will be saved for everyone to see.</p>
      </form>
    </section>
  `,
  styles: `
    .event-page { max-width: 44rem; margin: 2rem auto; }
    header { margin-bottom: 1.5rem; }
    fieldset { display: flex; flex-direction: column; gap: 1rem; min-width: 0; border: 0; padding: 0; margin: 0 0 1rem; }
    label { display: block; margin-bottom: 0.25rem; }
    .date-time { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    input[type="date"], input[type="time"] { color-scheme: dark; min-width: 0; }
    textarea { height: auto; min-height: 6rem; resize: vertical; }
    .error { color: var(--color-error); }
    @media (max-width: 480px) { .date-time { grid-template-columns: 1fr; } }
  `,
})
export class CreatePotLuckPageComponent {
  private readonly potlucks = inject(PotlucksService);
  private readonly router = inject(Router);
  protected readonly title = signal('');
  protected readonly date = signal('');
  protected readonly time = signal('');
  protected readonly location = signal('');
  protected readonly description = signal('');
  protected readonly photo = signal<File | null>(null);
  protected readonly saving = signal(false);
  protected readonly error = signal('');

  protected async cancel(): Promise<void> {
    if (!this.saving()) await this.router.navigateByUrl('/');
  }

  protected submit(): void {
    if (this.saving()) return;
    this.error.set('');
    this.saving.set(true);
    this.potlucks.create({
      title: this.title(),
      startsOn: this.date(),
      startTime: this.time(),
      location: this.location(),
      description: this.description(),
    }, this.photo()).pipe(
      switchMap((event) => this.router.navigate(['/details', event.id])),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      error: (error: unknown) =>
        this.error.set(error instanceof Error ? error.message : 'The event could not be created. Please try again.'),
    });
  }
}
