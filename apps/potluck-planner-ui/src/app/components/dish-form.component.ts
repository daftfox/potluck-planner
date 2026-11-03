import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DishDetails } from '../models/dish-details.model';
import { DishSuitability } from '../models/dish-suitability.model';
import { Dish } from '../models/dish.model';
import { PhotosService } from '../services/photos.service';
import { FileDropperComponent } from './file-dropper.component';
import { PotButtonComponent } from './pot-button.component';
import { DietarySelectorComponent } from './dietary-selector.component';

interface DishFormValue {
  name: string;
  description: string;
  photo: File | null;
  photoUrl?: string;
  prepNotes: string;
  suitableFor: DishSuitability[];
}

@Component({
  selector: 'dish-form',
  standalone: true,
  imports: [FormsModule, PotButtonComponent, DietarySelectorComponent, FileDropperComponent],
  styles: `
    fieldset {
      margin: 0;
      padding: 0;
      border: 0;
      min-width: 0;
    }

    .error {
      color: var(--color-error);
    }

    .dish-textarea {
      resize: vertical;
      min-height: 6rem;
      max-width: 100%;
    }
  `,
  template: `
    <form class="card p-5" (ngSubmit)="submitDish()">
      <fieldset class="flex flex-col gap-4" [disabled]="busy()">
        <div>
          <label for="dish-name" class="mb-1 block text-sm font-medium">Dish name</label>
          <input
            id="dish-name"
            type="text"
            class="w-full rounded-md border border-border bg-background px-3 py-2"
            [value]="form().name"
            (input)="updateField('name', $any($event.target).value)"
            placeholder="e.g. Lemon herb quinoa"
          />
        </div>

        <div>
          <label for="dish-description" class="mb-1 block text-sm font-medium">Description</label>
          <textarea
            id="dish-description"
            rows="3"
            class="dish-textarea w-full rounded-md border border-border bg-background px-3 py-2"
            [value]="form().description"
            (input)="updateField('description', $any($event.target).value)"
            placeholder="Add a short description"
          ></textarea>
        </div>

        <div>
          <p class="mb-1 text-sm font-medium">Photo (optional)</p>
          <file-dropper
            [file]="form().photo"
            [existingPhotoUrl]="form().photoUrl"
            [disabled]="busy()"
            (fileChanged)="updatePhoto($event)"
          />
        </div>

        <div>
          <label for="dish-prep-notes" class="mb-1 block text-sm font-medium">Prep notes</label>
          <textarea
            id="dish-prep-notes"
            rows="3"
            class="dish-textarea w-full rounded-md border border-border bg-background px-3 py-2"
            [value]="form().prepNotes"
            (input)="updateField('prepNotes', $any($event.target).value)"
            placeholder="Serving tips or prep instructions"
          ></textarea>
        </div>

        <dietary-selector
          [selected]="form().suitableFor"
          [disabled]="busy()"
          (selectedChange)="updateField('suitableFor', $event)"
        />

        @if (uploadError()) {
          <p class="error" role="alert" animate.enter="fade-in" animate.leave="fade-out">{{ uploadError() }}</p>
        }
        @if (saveError()) {
          <p class="error" role="alert" animate.enter="fade-in" animate.leave="fade-out">{{ saveError() }}</p>
        }
        <div class="flex justify-end gap-2" aria-live="polite">
          <pot-button type="button" variant="secondary" size="sm" [disabled]="busy()" (click)="cancel()">Cancel</pot-button>
          <pot-button type="submit" variant="primary" size="sm" [disabled]="busy()">
            {{ uploading() ? 'Uploading photo...' : saving() ? 'Saving...' : dish() ? 'Save changes' : 'Save dish' }}
          </pot-button>
        </div>
      </fieldset>
    </form>
  `,
})
export class DishFormComponent {
  private readonly photos = inject(PhotosService);
  readonly dish = input<Dish | null>(null);
  readonly saving = input(false);
  readonly saveError = input('');
  readonly submitted = output<DishDetails>();
  readonly cancelled = output<void>();
  protected readonly uploading = signal(false);
  protected readonly uploadError = signal('');
  protected readonly busy = computed(() => this.uploading() || this.saving());

  readonly form = linkedSignal<DishFormValue>(() => {
    const dish = this.dish();
    return {
      name: dish?.name ?? '',
      description: dish?.description ?? '',
      photo: null,
      photoUrl: dish?.photoUrl,
      prepNotes: dish?.prepNotes ?? '',
      suitableFor: [...(dish?.suitableFor ?? [])],
    };
  });

  protected updatePhoto(photo: File | null): void {
    this.form.update((current) => ({ ...current, photo, photoUrl: undefined }));
  }

  protected updateField<K extends keyof DishFormValue>(field: K, value: DishFormValue[K]): void {
    this.form.update((current) => ({
      ...current,
      [field]: value,
    }));
  }

  protected submitDish(): void {
    if (this.busy()) {
      return;
    }
    const value = this.form();
    this.uploadError.set('');
    if (!value.photo) {
      this.emitDish(value, value.photoUrl);
      return;
    }

    this.uploading.set(true);
    this.photos.upload(value.photo).pipe(
      finalize(() => this.uploading.set(false)),
    ).subscribe({
      next: (photoUrl) => {
        this.uploading.set(false);
        this.emitDish(value, photoUrl);
      },
      error: () => this.uploadError.set('The photo could not be uploaded. Please try again.'),
    });
  }

  private emitDish(value: DishFormValue, photoUrl: string | undefined): void {
    this.submitted.emit({
      name: value.name.trim(),
      description: value.description.trim() || undefined,
      photoUrl,
      prepNotes: value.prepNotes.trim() || undefined,
      suitableFor: value.suitableFor,
    });
  }

  protected cancel(): void {
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }
}
