"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { MediaImage } from "@/components/ui/media-image";
import { PLACEHOLDER_IMAGE } from "@/lib/media/image";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
      <Link href={`/products/${product.slug}`} className="group relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-surface transition-shadow duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <div className="relative aspect-square overflow-hidden bg-background">
          <motion.div whileHover={{ scale: 1.045 }} transition={{ duration: 0.4 }} className="relative h-full w-full">
            <MediaImage src={image?.url ?? PLACEHOLDER_IMAGE} alt={image?.alt ?? product.name} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw" className="object-cover" />
          </motion.div>
          {!product.inStock && <Badge variant="neutral" className="absolute left-3 top-3 z-10">Out of stock</Badge>}
          <span className="absolute bottom-3 right-3 grid h-10 w-10 translate-y-2 place-items-center rounded-full border border-white/60 bg-black/20 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">View product details</span>
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <span className="text-sm font-semibold text-default">{product.name}</span>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-brand">Request a quote</span>
          <span className="text-xs text-muted">Personalized pricing and availability</span>
        </div>
      </Link>
    </motion.div>
  );
}
