"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { getCategories } from "@/lib/api/categories";
import { categoryKeys } from "@/lib/queries/categories";
import { siteConfig } from "@/lib/config/site";
import { PLACEHOLDER_IMAGE } from "@/lib/media/image";

const MAX_SLIDES = 4;
const SLIDE_INTERVAL_MS = 6500;

interface Slide { key: string; kicker: string; title: string; copy: string; href: string; label: string; cta: string; image: string }

const fallbackSlide: Slide = {
  key: "all",
  kicker: "Welcome to Cimalc Tech.",
  title: "Technology, selected for you.",
  copy: siteConfig.shortDescription,
  href: "/products",
  label: "Products",
  cta: "Browse products",
  image: PLACEHOLDER_IMAGE,
};

export function Hero() {
  const [active, setActive] = useState(0);
  const { data: categories } = useQuery({ queryKey: categoryKeys.lists(), queryFn: getCategories });

  // One slide per category that has products, so every link leads somewhere real.
  const slides = useMemo<Slide[]>(() => {
    const fromCategories = (categories ?? [])
      .filter((category) => category.productCount > 0)
      .slice(0, MAX_SLIDES)
      .map((category) => ({
        key: category.slug,
        kicker: `We can help you find the right ${category.name.toLowerCase()}.`,
        title: category.name,
        copy: category.description ?? `Browse our ${category.name.toLowerCase()} and request a tailored quote.`,
        href: `/categories/${category.slug}`,
        label: category.name,
        cta: `Explore ${category.name}`,
        image: category.image ?? PLACEHOLDER_IMAGE,
      }));
    return fromCategories.length ? fromCategories : [fallbackSlide];
  }, [categories]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const index = active % slides.length;
  const slide = slides[index];

  return (
    <section className="relative flex overflow-hidden bg-brand text-white md:min-h-[min(88svh,900px)] dark:bg-hero">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col justify-center">
        <div className="grid items-center gap-10 px-4 py-12 sm:py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:px-8 md:py-16 lg:gap-16 lg:py-20">
          <div className="min-w-0 max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div key={slide.key} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.45 }}>
                <p className="text-base text-white/80 md:text-lg">{slide.kicker}</p>
                <h1 className="mt-4 text-[clamp(2.5rem,6vw,5.75rem)] font-bold leading-[1.02] tracking-[-0.04em] [overflow-wrap:anywhere] md:mt-5">{slide.title}</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85 md:mt-8 md:text-xl md:leading-9 lg:text-2xl lg:leading-10">{slide.copy}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-10 md:gap-4">
                  <Button href={slide.href} variant="secondary" size="lg" className="min-h-14 border-white bg-white px-8 text-base text-brand hover:bg-white/90 md:text-lg">{slide.cta} <ArrowRight className="h-5 w-5" aria-hidden="true" /></Button>
                  <Link href="/contact" className="inline-flex min-h-14 items-center justify-center rounded-sm border border-white/35 px-8 text-base font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:text-lg">Talk to our team</Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="relative mx-auto w-full max-w-[min(100%,440px)] md:max-w-[min(100%,calc(78svh*0.8),620px)]">
            <div className="absolute -inset-4 rotate-3 rounded-[2rem] border border-white/20 md:-inset-5" />
            <AnimatePresence mode="wait">
              <motion.div key={slide.key} initial={{ opacity: 0, x: 100, rotate: 8 }} animate={{ opacity: 1, x: 0, rotate: -3 }} exit={{ opacity: 0, x: -100, rotate: -8 }} transition={{ duration: 0.65, ease: "easeOut" }} className="relative overflow-hidden rounded-[1.5rem] border border-white/35 bg-white p-3 shadow-2xl md:rounded-[2rem] md:p-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-hero-soft md:rounded-2xl">
                  <MediaImage src={slide.image} alt={slide.label + " collection"} fill sizes="(max-width: 768px) 92vw, 620px" loading={index === 0 ? "eager" : "lazy"} className="object-cover" />
                </div>
                <div className="flex items-center justify-between px-2 pb-1 pt-3 text-hero md:pt-4">
                  <span className="truncate text-xs font-semibold uppercase tracking-[.16em] md:text-sm">{slide.label}</span>
                  <span className="shrink-0 pl-3 font-mono text-xs text-accent md:text-sm">CIMALC / {String(index + 1).padStart(2, "0")}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {slides.length > 1 && (
          <div className="flex gap-2 px-4 pb-8 md:px-8">
            {slides.map((item, slideIndex) => (
              <button key={item.key} type="button" aria-label={`Show ${item.label}`} aria-current={slideIndex === index} onClick={() => setActive(slideIndex)} className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${slideIndex === index ? "w-12 bg-hero-accent" : "w-5 bg-white/30 hover:bg-white/50"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
