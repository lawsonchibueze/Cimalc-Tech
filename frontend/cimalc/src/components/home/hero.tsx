"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, MessageCircle, Pause, Play } from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import { categoryKeys } from "@/lib/queries/categories";
import { siteConfig } from "@/lib/config/site";
import { HeroDeck, type DeckCard } from "./hero-deck";
import { HeroStats } from "./hero-stats";

const MAX_SLIDES = 4;
const SLIDE_INTERVAL_MS = 7000;

type Slide = DeckCard & { description: string };

const controlClass = "grid h-11 w-11 place-items-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

export function Hero() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const { data: categories } = useQuery({ queryKey: categoryKeys.lists(), queryFn: getCategories });

  // One card per category that has products, so every card leads somewhere real.
  const slides = useMemo<Slide[]>(() => {
    const fromCategories = (categories ?? [])
      .filter((category) => category.productCount > 0)
      .slice(0, MAX_SLIDES)
      .map((category) => ({ key: category.slug, label: category.name, href: `/categories/${category.slug}`, image: category.image, description: category.description ?? siteConfig.description }));
    return fromCategories.length ? fromCategories : [{ key: "all", label: "Our range", href: "/products", description: siteConfig.description }];
  }, [categories]);

  const autoplay = slides.length > 1 && !paused && !reducedMotion;
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActive((value) => (value + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, slides.length]);

  const index = active % slides.length;
  const slide = slides[index];
  const go = (offset: 1 | -1) => {
    setDirection(offset);
    setActive((index + offset + slides.length) % slides.length);
  };
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <section aria-roledescription="carousel" aria-label="Featured categories" className="overflow-hidden bg-logo text-white dark:bg-hero">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-12 md:px-8 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-20">
        {/* Text. Always its own column, never on top of a picture. */}
        <div className="min-w-0">
          <motion.h1 className="text-display font-extrabold leading-[0.96] tracking-[-0.03em]" initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="block">Technology,</span>
            <span className="block">selected</span>
            <span className="block">for you.</span>
          </motion.h1>
          <div className="mt-6 min-h-[4.5rem] max-w-2xl md:mt-8 md:min-h-[5rem]">
            <AnimatePresence mode="wait">
              <motion.p key={slide.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="text-lg leading-8 text-white/90 md:text-xl md:leading-9">
                {slide.description}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
            <Link href="/products" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-sm bg-white px-8 text-base font-bold text-logo shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-logo dark:text-brand md:text-lg">
              Explore products <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-sm border border-white/60 px-8 text-base font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:text-lg">
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> Talk to our team
            </Link>
          </div>
        </div>

        {/* Cards. Directly below the text on phones and tablets, beside it on wide screens. */}
        <div className="min-w-0">
          <HeroDeck cards={slides} index={index} direction={direction} onSwipe={go} />
          {slides.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3" role="group" aria-label="Slide controls">
              <button type="button" aria-label="Previous slide" onClick={() => go(-1)} className={controlClass}><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
              <span className="min-w-16 text-center font-mono text-sm font-semibold" aria-live="off">{pad(index + 1)} / {pad(slides.length)}</span>
              <button type="button" aria-label="Next slide" onClick={() => go(1)} className={controlClass}><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
              <button type="button" aria-label={paused ? "Play slideshow" : "Pause slideshow"} aria-pressed={paused} onClick={() => setPaused((value) => !value)} className={controlClass}>
                {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          )}
        </div>
      </div>
      <HeroStats />
    </section>
  );
}
