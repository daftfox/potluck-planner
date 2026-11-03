import { Component, effect, input, output, signal } from '@angular/core';
import { PotButtonComponent } from './pot-button.component';
import { PotIconComponent } from './pot-icon.component';

@Component({
  selector: 'file-dropper',
  standalone: true,
  imports: [PotButtonComponent, PotIconComponent],
  template: `
    <input
      #fileInput
      type="file"
      accept="image/png,image/jpeg,image/gif,image/webp"
      class="file-input"
      hidden
      [disabled]="disabled()"
      (change)="onFileSelected(fileInput)"
    />
    <button
      type="button"
      class="drop-zone"
      [class.dragging]="dragging()"
      [disabled]="disabled()"
      [attr.aria-label]="label()"
      (click)="fileInput.click()"
      (dragenter)="onDragEnter($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <pot-icon name="upload" color="primary" />
      <span>Drop a photo here or click to browse</span>
      <span class="text-sm text-muted-foreground">One image file</span>
    </button>
    <div aria-live="polite">
      @if (file() || existingPhotoUrl()) {
        <div class="selection" animate.enter="fade-in" animate.leave="fade-out">
          <div class="selected-file">
            @if (previewUrl(); as url) {
              <img
                animate.enter="fade-in"
                animate.leave="fade-out"
                class="thumbnail"
                [src]="url"
                [alt]="'Preview of ' + (file()?.name ?? 'current photo')"
                (error)="onPreviewError()"
              />
            }
            <span class="file-name">{{ file()?.name ?? 'Current photo' }}</span>
          </div>
          <pot-button type="button" variant="secondary" size="sm" [disabled]="disabled()" (click)="removeFile()">
            Remove photo
          </pot-button>
        </div>
      }
      @if (error()) {
        <p class="error" role="alert" animate.enter="fade-in" animate.leave="fade-out">{{ error() }}</p>
      }
      @if (previewError()) {
        <p class="error" role="alert" animate.enter="fade-in" animate.leave="fade-out">{{ previewError() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .file-input {
      display: none;
    }

    .drop-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 1.5rem;
      border: 1px dashed var(--color-border-input);
      border-radius: 0.75rem;
      background: transparent;
      color: var(--color-input);
      cursor: pointer;
      transition: border-color var(--transition-slow), background-color var(--transition-slow);
    }

    .drop-zone:hover:not(:disabled),
    .drop-zone.dragging {
      border-color: var(--color-primary);
      background-color: var(--color-primary-soft);
    }

    .drop-zone:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .drop-zone:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .selection {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-top: 0.75rem;
    }

    .file-name {
      overflow-wrap: anywhere;
      min-width: 0;
    }

    .selected-file {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 0;
    }

    .thumbnail {
      width: 5rem;
      height: 5rem;
      flex-shrink: 0;
      object-fit: cover;
      border-radius: 0.5rem;
    }

    .error {
      margin-top: 0.5rem;
      color: var(--color-error);
    }
  `,
})
export class FileDropperComponent {
  readonly label = input('Choose a dish photo or drop an image here');
  readonly disabled = input(false);
  readonly file = input<File | null>(null);
  readonly existingPhotoUrl = input<string | undefined>();
  readonly fileChanged = output<File | null>();
  protected readonly dragging = signal(false);
  protected readonly error = signal('');
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly previewError = signal('');
  private dragDepth = 0;

  constructor() {
    effect((onCleanup) => {
      const file = this.file();
      const existingPhotoUrl = this.existingPhotoUrl();
      this.previewError.set('');
      if (!file?.type.startsWith('image/')) {
        this.previewUrl.set(file ? null : existingPhotoUrl ?? null);
        return;
      }

      const url = URL.createObjectURL(file);
      this.previewUrl.set(url);
      onCleanup(() => URL.revokeObjectURL(url));
    });
  }

  protected onPreviewError(): void {
    this.previewUrl.set(null);
    this.previewError.set('This file could not be displayed as an image.');
  }

  protected onFileSelected(input: HTMLInputElement): void {
    if (input.files?.length) {
      this.selectFiles(Array.from(input.files));
    }
    input.value = '';
  }

  protected onDragEnter(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) {
      this.dragDepth += 1;
      this.dragging.set(true);
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.disabled() ? 'none' : 'copy';
    }
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    this.dragging.set(this.dragDepth > 0);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth = 0;
    this.dragging.set(false);
    this.selectFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  protected removeFile(): void {
    if (!this.disabled()) {
      this.error.set('');
      this.fileChanged.emit(null);
    }
  }

  private selectFiles(files: File[]): void {
    if (this.disabled()) {
      return;
    }
    if (files.length !== 1) {
      this.error.set('Please select one image file.');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(files[0].type)) {
      this.error.set('Choose a PNG, JPEG, GIF, or WebP image.');
      return;
    }
    this.error.set('');
    this.fileChanged.emit(files[0]);
  }
}
