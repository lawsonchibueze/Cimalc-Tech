"use client";

import { useCallback, useEffect, useRef } from "react";

interface Options {
  /** Turn the movement off, for example when there is only one item. */
  enabled: boolean;
  /** How many identical copies of the items are rendered, so the rail can loop without a seam. */
  copies: number;
  /** Items in one copy. */
  itemsPerCopy: number;
  /** Pixels per second. */
  speed?: number;
}

const ARROW_PAUSE_MS = 1600;
const TOUCH_PAUSE_MS = 4000;
const WHEEL_PAUSE_MS = 2500;

/** Distance from the first item to the same item in the next copy. That distance is the loop length. */
function loopLength(rail: HTMLElement, itemsPerCopy: number) {
  const first = rail.children[0] as HTMLElement | undefined;
  const next = rail.children[itemsPerCopy] as HTMLElement | undefined;
  return first && next ? next.offsetLeft - first.offsetLeft : 0;
}

/**
 * A horizontal rail that drifts on its own and loops forever, while arrow
 * buttons and manual scrolling keep working. The drift steps aside whenever a
 * person interacts, so the two never fight over the scroll position.
 */
export function useAutoScrollRail({ enabled, copies, itemsPerCopy, speed = 40 }: Options) {
  const rail = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  const hovering = useRef(false);

  const pause = useCallback((ms: number) => {
    pausedUntil.current = Math.max(pausedUntil.current, performance.now() + ms);
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el || !enabled || copies < 2) return;
    // People who ask their system for less motion still get the arrows and manual scrolling.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let previous = 0;
    let position = el.scrollLeft;
    let onScreen = true;
    const observer = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; });
    observer.observe(el);

    const tick = (time: number) => {
      const elapsed = Math.min(64, time - (previous || time));
      previous = time;
      const idle = onScreen && !document.hidden && !hovering.current && performance.now() >= pausedUntil.current;

      if (idle) {
        // Something else, such as an arrow or a swipe, moved the rail since the last frame.
        if (Math.abs(el.scrollLeft - position) > 1.5) position = el.scrollLeft;
        position += (speed * elapsed) / 1000;
        const loop = loopLength(el, itemsPerCopy);
        if (loop > 0 && position >= loop) position -= loop;
        el.scrollLeft = position;
      } else {
        position = el.scrollLeft;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [enabled, copies, itemsPerCopy, speed]);

  /** Scrolls one screen either way. Works from any position because the copies are identical. */
  const move = useCallback((direction: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    const loop = loopLength(el, itemsPerCopy);
    pause(ARROW_PAUSE_MS);
    if (loop > 0) {
      // Step to the equivalent spot in another copy first, so there is always room to scroll.
      if (direction < 0 && el.scrollLeft < amount) el.scrollLeft += loop;
      else if (direction > 0 && el.scrollLeft >= loop) el.scrollLeft -= loop;
    }
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }, [itemsPerCopy, pause]);

  const handlers = {
    onPointerEnter: (event: React.PointerEvent) => { if (event.pointerType === "mouse") hovering.current = true; },
    onPointerLeave: (event: React.PointerEvent) => { if (event.pointerType === "mouse") hovering.current = false; },
    onFocus: () => { hovering.current = true; },
    onBlur: () => { hovering.current = false; },
    onTouchStart: () => pause(TOUCH_PAUSE_MS),
    onWheel: () => pause(WHEEL_PAUSE_MS),
  };

  return { rail, move, handlers };
}
