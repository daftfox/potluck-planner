import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

type IconStyle = 'rounded' | 'sharp' | 'filled';
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type IconColor = 'inherit' | 'primary';

@Component({
  selector: 'pot-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="material-icons"
      [ngClass]="{
        'material-icons-rounded': style() === 'rounded',
        'material-icons-sharp': style() === 'sharp',
        'fill': style() === 'filled',
        'material-icons-xs': size() === 'xs',
        'material-icons-sm': size() === 'sm',
        'material-icons-md': size() === 'md',
        'material-icons-lg': size() === 'lg',
        'material-icons-xl': size() === 'xl',
        'material-icons-2xl': size() === '2xl',
        'material-icons-3xl': size() === '3xl',
        'material-icons-4xl': size() === '4xl',
        primary: color() === 'primary'
      }"
      [attr.aria-label]="ariaLabel()"
      [attr.role]="ariaLabel() ? 'img' : null"
    >
      {{ name() }}
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
  `
})
export class PotIconComponent {
  readonly name = input('info');
  readonly style = input<IconStyle>('rounded');
  readonly size = input<IconSize>('md');
  readonly color = input<IconColor>('inherit');
  readonly ariaLabel = input<string | undefined>(undefined);
}
