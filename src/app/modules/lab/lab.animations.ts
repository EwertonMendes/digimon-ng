import { DestroyRef, ElementRef, QueryList } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function setupLabCardAnimations(
  cards: QueryList<ElementRef>,
  viewportRef: ElementRef<HTMLElement>,
  destroyRef: DestroyRef
): void {
  const seen = new WeakSet<Element>();
  const created: ScrollTrigger[] = [];

  const animate = (targets: Element[]) => {
    targets.forEach(el => seen.add(el));
    gsap.set(targets, { opacity: 0, y: 24 });
    const scroller = viewportRef?.nativeElement;
    const trig = ScrollTrigger.batch(targets, {
      scroller,
      start: 'top 85%',
      onEnter: (els: Element[]) => {
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.06,
          overwrite: 'auto'
        });
      },
      onEnterBack: (els: Element[]) => {
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          overwrite: 'auto'
        });
      }
    });
    if (Array.isArray(trig)) created.push(...trig);
    else if (trig) created.push(trig as ScrollTrigger);
    try { ScrollTrigger.refresh(); } catch { }
  };

  const initial = cards.map(r => r.nativeElement as Element);
  if (initial.length) animate(initial);

  const sub = cards.changes.subscribe((q: QueryList<ElementRef>) => {
    const newEls = q.map(r => r.nativeElement as Element).filter(el => !seen.has(el));
    if (newEls.length) animate(newEls);
  });

  destroyRef.onDestroy(() => {
    sub.unsubscribe();
    created.forEach(t => t.kill());
    ScrollTrigger.getAll().forEach(t => t.kill());
    gsap.globalTimeline.clear();
  });
}
