import { Component, inject } from "@angular/core";
import { PotFeaturedPotLuckComponent } from "./pot-featured-pot-luck.component";
import { PotUpcomingPotLucksComponent } from "./pot-upcoming-pot-lucks.component";
import { PotlucksService } from "../services/potlucks.service";
import { SessionService } from "../services/session.service";
import { RouterLink } from "@angular/router";
import { PotIconComponent } from "./pot-icon.component";

@Component({
    selector: 'pot-landing-page',
    template: `
        <div animate.enter="fade-in" animate.leave="fade-out">
            @if (signedIn()) {
                <div class="flex justify-end mb-4" animate.enter="fade-in" animate.leave="fade-out">
                    <a class="button primary" routerLink="/organise">
                        <pot-icon name="add" />
                        Organise a pot-luck
                    </a>
                </div>
            }
            @if (featuredPotLuck(); as featured) {
                <pot-featured-pot-luck [potLuck]="featured"></pot-featured-pot-luck>
                <pot-upcoming-pot-lucks [potLucks]="upcomingPotLucks()"></pot-upcoming-pot-lucks>
            } @else if (loaded()) {
                <p class="text-muted-foreground">There are no upcoming pot-lucks yet.</p>
            } @else {
                <p class="text-muted-foreground">Loading pot-lucks...</p>
            }
        </div>
    `
    ,
    standalone: true,
    imports: [PotFeaturedPotLuckComponent, PotUpcomingPotLucksComponent, RouterLink, PotIconComponent]
})
export class LandingPageComponent {
    private readonly potlucks = inject(PotlucksService);

    readonly featuredPotLuck = this.potlucks.featuredPotLuck;
    protected readonly signedIn = inject(SessionService).signedIn;
    readonly upcomingPotLucks = this.potlucks.upcomingPotLucks;
    protected readonly loaded = this.potlucks.loaded;
}