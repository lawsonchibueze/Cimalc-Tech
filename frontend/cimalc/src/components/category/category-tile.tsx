import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

/**
 * Category card. The photo sits whole on a light panel with the name in a solid
 * strip below it, so nothing is washed over the picture.
 */
export function CategoryTile({ category, sizes, className, decorative = false }: { category: Category; sizes: string; className?: string; /** A repeated copy used only for looping. Hidden from assistive tech and the tab order. */ decorative?: boolean }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
      className={cn("group flex flex-col overflow-hidden rounded-md border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", className)}
    >
      <span className="relative block aspect-square overflow-hidden bg-slate-100">
        {category.image ? (
          <MediaImage src={category.image} alt="" fill sizes={sizes} className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center bg-logo/10 text-6xl font-bold text-logo/60">{category.name.charAt(0).toUpperCase()}</span>
        )}
      </span>
      <span className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <span className="min-w-0">
          <span className="block truncate text-base font-semibold text-default md:text-lg">{category.name}</span>
          <span className="block text-xs text-muted">{category.productCount} {category.productCount === 1 ? "product" : "products"}</span>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-logo text-white transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span>
      </span>
    </Link>
  );
}
