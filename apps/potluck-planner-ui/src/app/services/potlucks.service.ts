import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, of, switchMap, tap, timer } from 'rxjs';
import { DishDetails } from '../models/dish-details.model';
import { NewPotLuck } from '../models/new-pot-luck.model';
import { PotLuckItem } from '../models/pot-luck-item.model';
import { RsvpStatus } from '../models/rsvp-status.model';
import { ApiErrorService } from './api-error.service';
import { PhotosService } from './photos.service';
import { SessionService } from './session.service';

/** Start of a pot-luck in epoch milliseconds, interpreting its date and time in local time. */
function startsAt(potLuck: PotLuckItem): number {
  return new Date(`${potLuck.startsOn}T${potLuck.startTime}`).getTime();
}

function byStart(left: PotLuckItem, right: PotLuckItem): number {
  return startsAt(left) - startsAt(right);
}

/** Client and state store for the `/api/potlucks` endpoint, including RSVPs and dishes. */
@Injectable({
  providedIn: 'root',
})
export class PotlucksService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly photos = inject(PhotosService);
  private readonly errors = inject(ApiErrorService);
  private readonly baseUrl = '/api/potlucks';

  private readonly potLucks = signal<PotLuckItem[]>([]);
  private readonly loadedState = signal(false);
  readonly loaded = this.loadedState.asReadonly();
  // Re-evaluated every minute so pot-lucks drop out of "upcoming" once they start.
  private readonly now = toSignal(timer(0, 60_000).pipe(map(() => Date.now())), {
    initialValue: Date.now(),
  });
  readonly rsvpState = signal<Record<string, RsvpStatus>>({});
  /** Every known pot-luck, past and future, in start order. */
  readonly allPotLucks = this.potLucks.asReadonly();
  /** Pot-lucks that have not started yet, soonest first. */
  private readonly futurePotLucks = computed(() => {
    const now = this.now();
    return this.potLucks().filter((potLuck) => startsAt(potLuck) > now);
  });
  /** The next pot-luck to occur; never one that has already started. */
  readonly featuredPotLuck = computed(() => this.futurePotLucks()[0] ?? null);
  readonly upcomingPotLucks = computed(() => this.futurePotLucks().slice(1));
  readonly rsvpedPotLucks = computed(() =>
    this.allPotLucks()
      .flatMap((potLuck) => {
        const rsvpStatus = this.rsvpState()[potLuck.id];
        return rsvpStatus === undefined ? [] : [{ ...potLuck, rsvpStatus }];
      })
      .sort((a, b) => b.startsOn.localeCompare(a.startsOn)),
  );

  /** Reloads all pot-lucks, replacing the current state. */
  load(): Observable<void> {
    return this.http.get<PotLuckItem[]>(this.baseUrl).pipe(
      map((potlucks) => {
        this.potLucks.set([...potlucks].sort(byStart));
        this.loadedState.set(true);
        this.rsvpState.set(Object.fromEntries(
          potlucks.flatMap((potluck) => potluck.rsvpStatus
            ? [[potluck.id, potluck.rsvpStatus]]
            : []),
        ));
        this.errors.clear();
      }),
    );
  }

  getById(id: string): PotLuckItem | undefined {
    return this.allPotLucks().find((potluck) => potluck.id === id);
  }

  create(details: NewPotLuck, photo: File | null = null): Observable<PotLuckItem> {
    return this.session.requireSignedIn(() => photo ? this.photos.upload(photo) : of(undefined)).pipe(
      switchMap((imageUrl) => this.http.post<PotLuckItem>(this.baseUrl, { ...details, imageUrl })),
      tap((potluck) => this.store(potluck)),
    );
  }

  delete(potLuckId: string): Observable<void> {
    return this.session.requireSignedIn(() => this.http.delete<void>(this.potluckUrl(potLuckId)))
      .pipe(switchMap(() => this.load()));
  }

  saveRsvp(potLuckId: string, status: RsvpStatus): Observable<void> {
    return this.session.requireSignedIn(() =>
      this.http.post<PotLuckItem>(`${this.potluckUrl(potLuckId)}/rsvp`, { status }),
    ).pipe(map((potluck) => this.store(potluck)));
  }

  addDish(potLuckId: string, dish: DishDetails): Observable<void> {
    return this.session.requireSignedIn(() =>
      this.http.post<PotLuckItem>(`${this.potluckUrl(potLuckId)}/dishes`, dish),
    ).pipe(map((potluck) => this.store(potluck)));
  }

  updateDish(potLuckId: string, dishId: string, details: DishDetails): Observable<void> {
    return this.session.requireSignedIn(() =>
      this.http.patch<PotLuckItem>(
        `${this.potluckUrl(potLuckId)}/dishes/${encodeURIComponent(dishId)}`,
        details,
      ),
    ).pipe(map((potluck) => this.store(potluck)));
  }

  /** Forgets per-user state such as RSVPs, e.g. after signing out. */
  clearUserState(): void {
    this.rsvpState.set({});
  }

  private potluckUrl(potLuckId: string): string {
    return `${this.baseUrl}/${encodeURIComponent(potLuckId)}`;
  }

  private store(potluck: PotLuckItem): void {
    this.potLucks.update((current) => {
      const exists = current.some((item) => item.id === potluck.id);
      const updated = exists
        ? current.map((item) => item.id === potluck.id ? potluck : item)
        : [...current, potluck];
      return updated.sort(byStart);
    });
    this.rsvpState.update((current) => {
      const updated = { ...current };
      if (potluck.rsvpStatus) updated[potluck.id] = potluck.rsvpStatus;
      else delete updated[potluck.id];
      return updated;
    });
  }
}
