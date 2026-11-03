import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, map, Observable, switchMap } from 'rxjs';
import { SessionService } from './session.service';

const SUPPORTED_PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

/** Client for the `/api/photos` endpoint. */
@Injectable({
  providedIn: 'root',
})
export class PhotosService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly baseUrl = '/api/photos';

  /** Uploads an image and emits the URL it can be served from. */
  upload(file: File): Observable<string> {
    return this.session.requireSignedIn(() => defer(() => {
      if (!SUPPORTED_PHOTO_TYPES.includes(file.type)) {
        throw new Error('Choose a PNG, JPEG, GIF, or WebP image.');
      }
      return this.readAsDataUrl(file);
    })).pipe(
      switchMap((dataUrl) => this.http.post<{ photoUrl: string }>(this.baseUrl, { dataUrl })),
      map((response) => response.photoUrl),
    );
  }

  private readAsDataUrl(file: File): Observable<string> {
    return new Observable<string>((subscriber) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          subscriber.next(reader.result);
          subscriber.complete();
        } else {
          subscriber.error(new Error('The photo could not be read.'));
        }
      };
      reader.onerror = () => subscriber.error(reader.error ?? new Error('The photo could not be read.'));
      reader.onabort = () => subscriber.error(new Error('The photo upload was cancelled.'));
      reader.readAsDataURL(file);
      return () => {
        if (reader.readyState === FileReader.LOADING) reader.abort();
      };
    });
  }
}
