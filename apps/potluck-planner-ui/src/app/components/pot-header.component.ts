import { Component, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { SessionService } from "../services/session.service";
import { PotIconComponent } from "./pot-icon.component";

@Component({
    selector: 'pot-header',
    standalone: true,
    template: `
        <header>
            <div>
                <a class="flex items-center gap-2.5" routerLink="/">
                    <span class="logo">
                        <!-- <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg> -->
                         <img src="/images/happy-coconut-64x64.png" alt="Coconut Club" />
                    </span>
                    <span class="branding">
                        Coconut Club Kai Time
                    </span>
                </a>
                <nav class="flex items-center gap-1.5">
                    <a class="button sm" routerLink="/" routerLinkActive="primary" [routerLinkActiveOptions]="{ exact: true }" ariaCurrentWhenActive="page">
                        <pot-icon name="calendar_month" />
                        <span class="hidden sm:inline">
                            Home
                        </span>
                    </a>
                    @if (signedIn()) {
                        <a class="button sm" routerLink="/profile" routerLinkActive="primary" ariaCurrentWhenActive="page" animate.enter="fade-in" animate.leave="fade-out">
                            <pot-icon name="person" />
                            <span class="hidden sm:inline">
                                Profile
                            </span>
                        </a>
                        @if (isAdmin()) {
                        <a class="button sm" routerLink="/admin" routerLinkActive="primary" ariaCurrentWhenActive="page" animate.enter="fade-in" animate.leave="fade-out">
                            <pot-icon name="settings" />
                            <span class="hidden sm:inline">
                                Admin
                            </span>
                        </a>
                        }
                    }
                </nav>
                <div class="flex items-center gap-3">
                    @if (signedIn()) {
                        <div class="hidden text-right sm:block" animate.enter="fade-in" animate.leave="fade-out">
                            <p class="text-sm font-medium leading-tight">
                                {{ currentUser().name }}
                            </p>
                            <p class="text-xs capitalize text-muted-foreground">
                                {{ currentUser().role }}
                            </p>
                        </div>
                        <button class="button sm round" type="button" aria-label="Log out" (click)="logout()" animate.enter="fade-in" animate.leave="fade-out">
                            <pot-icon name="logout" />
                        </button>
                    } @else {
                        <a class="button sm" routerLink="/login" animate.enter="fade-in" animate.leave="fade-out">Log in</a>
                        <a class="button sm primary" routerLink="/register" animate.enter="fade-in" animate.leave="fade-out">Register</a>
                    }
                </div>
            </div>
        </header>
    `,
    styles: `
        :host {
            header {
                border-bottom: 1px solid var(--color-border);
                z-index: 40;
                position: sticky;
                top: 0;
                background-color: alpha(from var(--color-background) / 85%);
                backdrop-filter: blur(12px);

                > div {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;


                    max-width: 72rem;
                    padding: 0.75rem 1.5rem;
                    margin: 0 auto;
                    gap: 1rem;

                    .logo {
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        width: 2.25rem;
                        height: 2.25rem;

                        border-radius: 9999px;

                        svg {
                            width: 1rem;
                            height: 1rem;
                        }
                    }

                    .branding {
                        font-family: 'Fraunces', serif;
                        font-weight: 600;
                        font-size: var(--font-size-xl);
                        line-height: var(--line-height-xl);
                    }
                }
            }
        }
    `,
    imports: [PotIconComponent, RouterLink, RouterLinkActive]
})
export class PotHeaderComponent {
    private readonly auth = inject(AuthService);
    private readonly session = inject(SessionService);
    private readonly router = inject(Router);
    protected readonly currentUser = this.session.currentUser;
    protected readonly signedIn = this.session.signedIn;
    protected readonly isAdmin = this.session.isAdmin;

    protected logout(): void {
        this.auth.logout().subscribe(() => void this.router.navigateByUrl('/login'));
    }
}