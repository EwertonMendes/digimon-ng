import { Injectable } from '@angular/core';
import gsap from 'gsap';

@Injectable({ providedIn: 'root' })
export class AttackAnimationService {
  private timelines = new Map<string, gsap.core.Timeline>();

  animateAttackUsingElement(
    attackerEl: HTMLElement,
    targetEl: HTMLElement,
    id?: string
  ): Promise<void> {
    if (!attackerEl || !targetEl) return Promise.resolve();

    const attackerRect = attackerEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const attackerCenterX = attackerRect.left + attackerRect.width / 2 + window.scrollX;
    const attackerCenterY = attackerRect.top + attackerRect.height / 2 + window.scrollY;
    const targetCenterX = targetRect.left + targetRect.width / 2 + window.scrollX;
    const targetCenterY = targetRect.top + targetRect.height / 2 + window.scrollY;

    const dx = targetCenterX - attackerCenterX;
    const dy = targetCenterY - attackerCenterY;

    const startLeft = attackerRect.left + window.scrollX;
    const startTop = attackerRect.top + window.scrollY;
    const width = attackerRect.width;
    const height = attackerRect.height;

    this.clearTimeline(id);

    return new Promise((resolve) => {
      if (!this.hasProblematicAncestor(attackerEl)) {
        this.animateWithTransformOnly(attackerEl, targetEl, dx, dy, id, resolve);
        return;
      }
      this.animateWithPlaceholder(attackerEl, targetEl, dx, dy, startLeft, startTop, width, height, id, resolve);
    });
  }

  cancel(id: string) {
    this.clearTimeline(id);
  }

  private hasProblematicAncestor(el: HTMLElement): boolean {
    let node: HTMLElement | null = el.parentElement;
    while (node && node !== document.body) {
      const cs = getComputedStyle(node);
      const problematic =
        (cs.transform && cs.transform !== 'none') ||
        (cs.perspective && cs.perspective !== 'none') ||
        (cs.filter && cs.filter !== 'none') ||
        (cs.willChange && /transform|perspective|filter/.test(cs.willChange)) ||
        (cs.overflow && (cs.overflow === 'hidden' || cs.overflow === 'clip'));
      if (problematic) return true;
      node = node.parentElement;
    }
    return false;
  }

  private copyLayoutStyles(src: HTMLElement, dest: HTMLElement) {
    const cs = getComputedStyle(src);
    dest.style.display = cs.display;
    dest.style.width = cs.width;
    dest.style.height = cs.height;
    dest.style.boxSizing = cs.boxSizing;
    dest.style.margin = cs.margin;
    dest.style.flexBasis = cs.flexBasis;
    dest.style.flexGrow = cs.flexGrow;
    dest.style.flexShrink = cs.flexShrink;
    dest.style.order = cs.order;
    dest.style.alignSelf = cs.alignSelf;
    dest.style.verticalAlign = cs.verticalAlign;
  }

  private clearTimeline(id?: string) {
    if (!id) return;
    const prev = this.timelines.get(id);
    if (!prev) return;
    prev.eventCallback('onComplete', null);
    prev.eventCallback('onInterrupt', null);
    prev.kill();
    this.timelines.delete(id);
  }

  private animateWithTransformOnly(
    attackerEl: HTMLElement,
    targetEl: HTMLElement,
    dx: number,
    dy: number,
    id: string | undefined,
    resolve: () => void
  ) {
    const tl = gsap.timeline({
      onComplete: () => {
        attackerEl.style.willChange = '';
        attackerEl.style.zIndex = '';
        if (id) this.timelines.delete(id);
        resolve();
      }
    });

    if (id) this.timelines.set(id, tl);

    attackerEl.style.willChange = 'transform';
    attackerEl.style.zIndex = '9999';

    tl.to(attackerEl, { duration: 0.36, x: dx, y: dy, scale: 1.05, ease: 'power2.out', overwrite: 'auto' })
      .to(
        targetEl,
        { duration: 0.12, y: -8, scale: 0.98, yoyo: true, repeat: 1, ease: 'power1.inOut', overwrite: 'auto' },
        '<'
      )
      .to(attackerEl, { duration: 0.32, x: 0, y: 0, scale: 1, ease: 'power2.inOut', overwrite: 'auto' });
  }

  private animateWithPlaceholder(
    attackerEl: HTMLElement,
    targetEl: HTMLElement,
    dx: number,
    dy: number,
    startLeft: number,
    startTop: number,
    width: number,
    height: number,
    id: string | undefined,
    resolve: () => void
  ) {
    const parent = attackerEl.parentElement;
    if (!parent) {
      resolve();
      return;
    }

    const placeholder = attackerEl.cloneNode(false) as HTMLElement;
    this.copyLayoutStyles(attackerEl, placeholder);
    placeholder.style.visibility = 'hidden';
    placeholder.style.pointerEvents = 'none';

    parent.replaceChild(placeholder, attackerEl);
    document.body.appendChild(attackerEl);

    const originalStyles = {
      position: attackerEl.style.position || '',
      left: attackerEl.style.left || '',
      top: attackerEl.style.top || '',
      width: attackerEl.style.width || '',
      height: attackerEl.style.height || '',
      margin: attackerEl.style.margin || '',
      zIndex: attackerEl.style.zIndex || '',
      pointerEvents: attackerEl.style.pointerEvents || '',
      transform: attackerEl.style.transform || '',
      willChange: attackerEl.style.willChange || ''
    };

    Object.assign(attackerEl.style, {
      position: 'fixed',
      left: `${startLeft}px`,
      top: `${startTop}px`,
      width: `${width}px`,
      height: `${height}px`,
      margin: '0',
      zIndex: '9999',
      pointerEvents: 'none',
      willChange: 'transform'
    });

    const cleanup = () => {
      tl.eventCallback('onComplete', null);
      tl.eventCallback('onInterrupt', null);
      Object.assign(attackerEl.style, originalStyles);
      if (placeholder.parentElement === parent) {
        parent.replaceChild(attackerEl, placeholder);
      } else {
        parent.appendChild(attackerEl);
      }
      if (placeholder.parentElement) placeholder.remove();
      if (id) this.timelines.delete(id);
      resolve();
    };

    const tl = gsap.timeline({ onComplete: cleanup, onInterrupt: cleanup });
    if (id) this.timelines.set(id, tl);

    tl.to(attackerEl, { duration: 0.36, x: dx, y: dy, scale: 1.05, ease: 'power2.out', overwrite: 'auto' })
      .to(
        targetEl,
        { duration: 0.12, y: -8, scale: 0.98, yoyo: true, repeat: 1, ease: 'power1.inOut', overwrite: 'auto' },
        '<'
      )
      .to(attackerEl, { duration: 0.32, x: 0, y: 0, scale: 1, ease: 'power2.inOut', overwrite: 'auto' });
  }
}
