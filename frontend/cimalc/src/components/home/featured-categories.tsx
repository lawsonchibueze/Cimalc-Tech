"use client";
import Link from "next/link";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import { categoryKeys } from "@/lib/queries/categories";
import { CategoryTile } from "@/components/category/category-tile";
import { Skeleton } from "@/components/ui/skeleton";

const arrowClass = "grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-default transition-colors hover:bg-brand hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function FeaturedCategories() {
  const rail = useRef<HTMLDivElement>(null);
  const { data: categories, isLoading } = useQuery({ queryKey: categoryKeys.lists(), queryFn: getCategories });
  function move(direction: number) { rail.current?.scrollBy({ left: direction * (rail.current.clientWidth * 0.8), behavior: "smooth" }); }

  if (!isLoading && !categories?.length) return null;

  return (
    <section className="mx-auto max-w-[1440px] overflow-hidden px-4 py-16 md:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Explore by category</p>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button type="button" aria-label="Show previous categories" onClick={() => move(-1)} className={arrowClass}><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
            <button type="button" aria-label="Show next categories" onClick={() => move(1)} className={arrowClass}><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
          </div>
          <Link href="/categories" className="hidden items-center gap-1 text-sm font-medium text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:flex">View all <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}</div>
      ) : (
        <div ref={rail} className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories?.map((category) => (
            <CategoryTile key={category.id} category={category} sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 320px" className="w-[70vw] shrink-0 snap-start sm:w-[42vw] md:w-[28vw] lg:w-[calc((100vw-8rem)/4)] lg:max-w-[320px]" />
          ))}
        </div>
      )}
    </section>
  );
}
