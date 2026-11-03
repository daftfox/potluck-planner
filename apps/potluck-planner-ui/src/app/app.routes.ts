import { inject } from '@angular/core';
import { Route, Router } from '@angular/router';
import { SessionService } from './services/session.service';
import { AuthPageComponent } from './components/auth-page.component';
import { LandingPageComponent } from './components/landing-page.component';
import { PotLuckDetailsComponent } from './components/pot-luck-details.component';
import { ProfilePageComponent } from './components/profile-page.component';
import { CreatePotLuckPageComponent } from './components/create-pot-luck-page.component';
import { AdminPageComponent } from './components/admin-page.component';

export const appRoutes: Route[] = [
  { path: '', component: LandingPageComponent },
  { path: 'details/:id', component: PotLuckDetailsComponent },
  {
    path: 'admin',
    component: AdminPageComponent,
    canActivate: [
      () => {
        const session = inject(SessionService);
        const router = inject(Router);
        if (!session.signedIn()) return router.createUrlTree(['/login']);
        return session.isAdmin() || router.createUrlTree(['/']);
      },
    ],
  },
  {
    path: 'organise',
    component: CreatePotLuckPageComponent,
    canActivate: [
      () => inject(SessionService).signedIn() || inject(Router).createUrlTree(['/login']),
    ],
  },
  {
    path: 'profile',
    component: ProfilePageComponent,
    canActivate: [
      () => inject(SessionService).signedIn() || inject(Router).createUrlTree(['/login']),
    ],
  },
  { path: 'login', component: AuthPageComponent },
  { path: 'register', component: AuthPageComponent, data: { registering: true } },
];
