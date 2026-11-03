import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

/** Tracks the most recent API error message for display in the app shell. */
@Injectable({
  providedIn: 'root',
})
export class ApiErrorService {
  private readonly messageState = signal('');
  readonly message = this.messageState.asReadonly();

  report(error: unknown): void {
    this.messageState.set(this.toMessage(error));
  }

  clear(): void {
    this.messageState.set('');
  }

  toMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }
    if (error instanceof HttpErrorResponse && Array.isArray(error.error?.message)) {
      return error.error.message.join(' ');
    }
    if (error instanceof Error) return error.message;
    return 'The request could not be completed. Please try again.';
  }
}
