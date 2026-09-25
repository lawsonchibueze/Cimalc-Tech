"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type TargetAndTransition } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { PLACEHOLDER_IMAGE } from "@/lib/media/image";

export interface DeckCard { key: string; label: string; href: string; image?: string }

interface HeroDeckProps {
  cards: DeckCard[];
  index: number;
  /** 1 when the last change moved forward, -1 when it moved back. Decides which way a card flies. */
  direction: 1 | -1;
  onSwipe: (direction: 1 | -1) => void;
}

const VISIBLE_BEHIND = 2;
const SWIPE_DISTANCE = 80;

/** Where a card rests when it sits `depth` places behind the front card. */
function pose(depth: number, total: number) {
  const shown = Math.min(depth, VISIBLE_BEHIND);
  return {
    x: shown * 26,
    y: shown * -18,
    rotate: shown * 5,
    scale: 1 - shown * 0.06,
    opacity: depth > VISIBLE_BEHIND ? 0 : 1 - shown * 0.18,
    zIndex: total - depth,
  };
}

/**
 * A stack of category cards. The front card is thrown off to the side and tucked
 * under the pile when the slide changes, the pile follows the pointer in 3D, the
 * whole stack floats, cards are dealt in on first view, and the front card can be
 * swiped on touch screens.
 */
export function HeroDeck({ cards, index, direction, onSwipe }: HeroDeckProps) {
  const reduced = useReducedMotion();
  const total = cards.length;
  const dragged = useRef(false);

  // Pointer tilt, smoothed with a spring so it feels weighty rather than twitchy.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), { stiffness: 150, damping: 18 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 18 });

  function track(event: React.PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - box.left) / box.width - 0.5);
    py.set((event.clientY - box.top) / box.height - 0.5);
  }
  function reset() { px.set(0); py.set(0); }

  return (
    <div className="relative mx-auto w-full max-w-[520px] pr-14 pt-10 [perspective:1400px]" onPointerMove={track} onPointerLeave={reset}>
      <motion.div
        className="relative aspect-[4/3.4] w-full [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
        animate={reduced ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {cards.map((card, cardIndex) => {
          const depth = (cardIndex - index + total) % total;
          const rest = pose(depth, total);
          const front = depth === 0;
          // The card that just left the front is thrown off to the right, away from the text, and tucked under the pile.
          const thrown = direction === 1 && depth === total - 1 && total > 1;
          // Going back, the card coming to the front is pulled out from under the pile.
          const pulled = direction === -1 && front && total > 1;

          let animate: TargetAndTransition = rest;
          if (!reduced && thrown) {
            animate = { ...rest, x: [0, 480, rest.x], y: [0, 30, rest.y], rotate: [0, 26, rest.rotate], scale: [1, 0.92, rest.scale], opacity: [1, 1, rest.opacity], zIndex: [total + 1, total + 1, rest.zIndex] };
          } else if (!reduced && pulled) {
            const from = pose(total - 1, total);
            animate = { ...rest, x: [from.x, 480, 0], y: [from.y, 30, 0], rotate: [from.rotate, 26, 0], scale: [from.scale, 0.92, 1], opacity: [from.opacity, 1, 1], zIndex: [0, total + 1, total + 1] };
          }

          return (
            <motion.div
              key={card.key}
              className="absolute inset-0 will-change-transform"
              initial={reduced ? false : { y: 160, rotate: 18 - cardIndex * 6, opacity: 0, scale: 0.85 }}
              animate={animate}
              transition={thrown || pulled
                ? { duration: 0.9, times: [0, 0.45, 1], ease: "easeInOut" }
                : { type: "spring", stiffness: 170, damping: 20 }}
              drag={front && total > 1 && !reduced ? "x" : false}
              dragSnapToOrigin
              dragElastic={0.6}
              onDragStart={() => { dragged.current = true; }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_DISTANCE) onSwipe(1);
                else if (info.offset.x > SWIPE_DISTANCE) onSwipe(-1);
                window.setTimeout(() => { dragged.current = false; }, 60);
              }}
              whileHover={front && !reduced ? { scale: 1.03 } : undefined}
              aria-hidden={!front}
              style={{ pointerEvents: front ? "auto" : "none" }}
            >
              <Link
                href={card.href}
                tabIndex={front ? 0 : -1}
                draggable={false}
                onClick={(event) => { if (dragged.current) event.preventDefault(); }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white p-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white md:p-4"
              >
                <span className="relative block flex-1 overflow-hidden rounded-xl bg-slate-100">
                  <MediaImage src={card.image ?? PLACEHOLDER_IMAGE} alt={`${card.label} collection`} fill sizes="(max-width: 1024px) 90vw, 520px" loading={front ? "eager" : "lazy"} draggable={false} className="object-contain p-2 transition-transform duration-700 group-hover:scale-105" />
                </span>
                <span className="flex items-center justify-between gap-3 px-1 pt-3 text-slate-900 md:pt-4">
                  <span className="truncate text-sm font-bold uppercase tracking-[0.16em] md:text-base">{card.label}</span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-logo text-white transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
