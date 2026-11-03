import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { appRoutes } from './app.routes';
import { apiInterceptor } from './services/api.interceptor';
import { AuthService } from './services/auth.service';
import { PotlucksService } from './services/potlucks.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideAppInitializer(() => {
      const potlucks = inject(PotlucksService);
      // Failures are reported by the API interceptor; never block the app from starting.
      return inject(AuthService).restoreSession().pipe(
        switchMap(() => potlucks.load()),
        catchError(() => of(undefined)),
      );
    }),
    provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled' })),
  ],
};
