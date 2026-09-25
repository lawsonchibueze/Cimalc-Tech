"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MediaImage } from "@/components/ui/media-image";
import { PLACEHOLDER_IMAGE } from "@/lib/media/image";
import type { ProductImage } from "@/types/product";

/** Keeps the stage compact so one product image never dominates the detail page. */
const STAGE_WIDTH = "max-w-[380px]";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-md border border-border bg-background",
          STAGE_WIDTH,
        )}
      >
        <MediaImage
          src={activeImage?.url ?? PLACEHOLDER_IMAGE}
          alt={activeImage?.alt ?? "Product image"}
          fill
          loading="eager"
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div
          className={cn(
            "flex w-full flex-nowrap gap-3 overflow-x-auto pb-1",
            STAGE_WIDTH,
          )}
        >
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={activeIndex === i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border-2 bg-background transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                activeIndex === i ? "border-brand" : "border-border",
              )}
            >
              <MediaImage
                src={image.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
