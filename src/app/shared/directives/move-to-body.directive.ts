import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';

/**
 * Przenosi element do body – naprawia position:fixed gdy ancestor ma transform
 * (np. mat-drawer-container). Modal rezerwacji działa bo jest w body.
 */
@Directive({
  selector: '[appMoveToBody]',
  standalone: true
})
export class MoveToBodyDirective implements OnInit, OnDestroy {
  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    document.body.appendChild(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.el.nativeElement.remove();
  }
}
