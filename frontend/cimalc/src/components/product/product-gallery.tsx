"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MediaImage } from "@/components/ui/media-image";
import { PLACEHOLDER_IMAGE } from "@/lib/media/image";
import type { ProductImage } from "@/types/product";

export function ProductGallery({ images }: { images: ProductImage[] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeImage = images[activeIndex] ?? images[0];
    return (
        <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-background">
                <MediaImage src={activeImage?.url ?? PLACEHOLDER_IMAGE} alt={activeImage?.alt ?? "Product image"} fill loading="eager" sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
            </div>
            {images.length > 1 && (
                <div className="flex flex-wrap gap-3">
                    {images.map((image, i) => (
                        <button
                            key={image.id}
                            type="button"
                            aria-label={`View image ${i + 1} of ${images.length}`}
                            aria-current={activeIndex === i}
                            onClick={() => setActiveIndex(i)}
                            className={cn("relative h-16 w-16 overflow-hidden rounded-sm border-2 bg-background transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", activeIndex === i ? "border-brand" : "border-border")}
                        >
                            <MediaImage src={image.url} alt="" fill sizes="64px" className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
