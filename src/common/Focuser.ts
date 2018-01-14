import {Directive, Renderer, ElementRef, OnInit} from '@angular/core';
@Directive({
  selector : '[focuser]'
})
export class Focuser  implements OnInit {
  constructor(public renderer: Renderer, public elementRef: ElementRef) {}

  ngOnInit() {
    console.log('init focuser');
    const searchInput = this.elementRef.nativeElement.querySelector('input');
    setTimeout(() => {
      console.log('ok time to focus');
      //delay required or ionic styling gets finicky
      this.renderer.invokeElementMethod(searchInput, 'click', []);
    }, 150);
  }
}