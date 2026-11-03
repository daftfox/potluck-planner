import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[smoothHeight]',
  standalone: true,
  host: { class: 'smooth-height' },
})
export class SmoothHeightDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const host = this.element.nativeElement;
      const content = host.firstElementChild;
      if (!(content instanceof HTMLElement)) {
        throw new Error('smoothHeight requires a content wrapper.');
      }

      const updateHeight = () => {
        host.style.height = `${content.getBoundingClientRect().height}px`;
      };
      updateHeight();
      const observer = new ResizeObserver(updateHeight);
      observer.observe(content);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
