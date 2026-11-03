import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PotHeaderComponent } from './components/pot-header.component';
import { ApiErrorService } from './services/api-error.service';

@Component({
  imports: [RouterModule, PotHeaderComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly loadError = inject(ApiErrorService).message;
}
