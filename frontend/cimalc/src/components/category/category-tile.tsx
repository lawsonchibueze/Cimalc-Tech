import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

/** Category card. Uses the image of a real product in the category, or a neutral tile when there is none. */
export function CategoryTile({ category, sizes, className, decorative = false }: { category: Category; sizes: string; className?: string; /** A repeated copy used only for looping. Hidden from assistive tech and the tab order. */ decorative?: boolean }) {
  return (
    <Link href={`/categories/${category.slug}`} aria-hidden={decorative || undefined} tabIndex={decorative ? -1 : undefined} className={cn("group relative block aspect-square overflow-hidden rounded-md border border-border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", className)}>
      {category.image ? (
        <MediaImage src={category.image} alt="" fill sizes={sizes} className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand/15 to-accent/20 text-6xl font-bold text-brand/50">{category.name.charAt(0).toUpperCase()}</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-brand/90 via-brand/15 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
        <span>
          <span className="block text-base font-semibold text-white md:text-lg">{category.name}</span>
          <span className="block text-xs text-white/75">{category.productCount} {category.productCount === 1 ? "product" : "products"}</span>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-transform group-hover:translate-x-1"><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span>
      </div>
    </Link>
  );
}
