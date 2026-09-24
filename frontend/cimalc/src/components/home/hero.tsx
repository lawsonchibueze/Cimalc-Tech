"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, MessageCircle, Pause, Play } from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import { categoryKeys } from "@/lib/queries/categories";
import { siteConfig } from "@/lib/config/site";
import { HeroBackdrop } from "./hero-backdrop";
import { HeroStats } from "./hero-stats";

const MAX_SLIDES = 4;
const SLIDE_INTERVAL_MS = 7000;

interface Slide { key: string; label: string; href: string; image?: string; description: string }

const controlClass = "grid h-11 w-11 place-items-center border border-white/40 bg-black/25 text-white backdrop-blur transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

export function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const { data: categories } = useQuery({ queryKey: categoryKeys.lists(), queryFn: getCategories });

  // One slide per category that has products, so the picture always matches a real place to click.
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
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, slides.length]);

  const index = active % slides.length;
  const slide = slides[index];
  const go = (offset: number) => setActive((index + offset + slides.length) % slides.length);
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <section aria-roledescription="carousel" aria-label="Featured categories" className="relative isolate overflow-hidden bg-brand text-white">
      {/* Photo layers. Slides cross-fade and drift slowly, so the page feels alive without moving text. */}
      <div className="absolute inset-0 -z-20">
        {slides.map((item, itemIndex) => (
          <HeroBackdrop key={item.key} image={item.image} active={itemIndex === index} reducedMotion={Boolean(reducedMotion)} />
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-brand via-brand/80 to-brand/10" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.22),transparent_45%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="mx-auto flex relative min-h-[600px] max-w-[1440px] flex-col justify-center px-4 py-14 md:min-h-[min(74svh,700px)] md:px-8 md:py-16">
        <h1 className="text-display font-extrabold leading-[0.96] tracking-[-0.03em]">
          <span className="block">Technology,</span>
          <span className="block">selected</span>
          <span className="block">for you.</span>
        </h1>
        <div className="mt-6 min-h-[4.5rem] max-w-2xl md:mt-8 md:min-h-[5rem]">
          <AnimatePresence mode="wait">
            <motion.p key={slide.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="text-lg leading-8 text-white/90 md:text-xl md:leading-9">{slide.description}</motion.p>
          </AnimatePresence>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
          <Link href="/products" className="inline-flex min-h-14 items-center justify-center gap-2 bg-white px-8 text-base font-bold text-brand shadow-lg shadow-black/30 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:text-lg">
            Explore products <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link href="/contact" className="inline-flex min-h-14 items-center justify-center gap-2 border border-white/50 px-8 text-base font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:text-lg">
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> Talk to our team
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3 xl:absolute xl:bottom-8 xl:right-28 xl:mt-0 xl:flex-col xl:items-end">
          <Link href={slide.href} className="inline-flex items-center gap-2 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            {slide.label} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {slides.length > 1 && (
            <div className="flex items-center gap-2" role="group" aria-label="Slide controls">
              <button type="button" aria-label="Previous slide" onClick={() => go(-1)} className={controlClass}><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
              <span className="px-2 font-mono text-sm font-semibold" aria-live="off">{pad(index + 1)} / {pad(slides.length)}</span>
              <button type="button" aria-label="Next slide" onClick={() => go(1)} className={controlClass}><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
              <button type="button" aria-label={paused ? "Play slideshow" : "Pause slideshow"} aria-pressed={paused} onClick={() => setPaused((value) => !value)} className={`${controlClass} rounded-full`}>
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
