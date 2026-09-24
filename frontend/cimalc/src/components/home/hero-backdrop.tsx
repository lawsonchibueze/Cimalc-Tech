"use client";
import { motion } from "motion/react";
import { MediaImage } from "@/components/ui/media-image";

interface LayerProps {
  image?: string;
  active: boolean;
}

/**
 * Full-width background for one slide. It is a soft, blurred copy of the photo, so it
 * fills the whole banner edge to edge whatever the photo's shape, and it takes on the
 * photo's colours. Every slide stays mounted and only fades, so the next one is ready.
 */
export function HeroBackdrop({ image, active }: LayerProps) {
  return (
    <motion.div className="absolute inset-0" initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: 1 }} aria-hidden="true">
      {image ? (
        <>
          <div className="absolute inset-0 scale-110 opacity-60 blur-2xl">
            <MediaImage src={image} alt="" fill sizes="50vw" loading="eager" className="object-cover" />
          </div>
          {/* Wide screens: the photo itself, whole and sharp, on the right. Nothing is drawn over it. */}
          <div className="absolute inset-y-0 right-0 hidden w-[48%] items-center justify-center p-8 lg:flex">
            <div className="relative h-full max-h-[620px] w-full">
              <MediaImage src={image} alt="" fill sizes="48vw" loading="eager" className="object-contain drop-shadow-2xl" />
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand to-black/40 dark:from-hero" />
      )}
    </motion.div>
  );
}

/** Phones and tablets: the whole photo as its own card between the buttons and the controls. */
export function HeroMobilePicture({ images, index }: { images: Array<string | undefined>; index: number }) {
  if (!images.some(Boolean)) return null;
  return (
    <div className="relative mt-8 aspect-[4/3] w-full lg:hidden" aria-hidden="true">
      {images.map((image, imageIndex) =>
        image ? (
          <motion.div key={image} className="absolute inset-0" initial={false} animate={{ opacity: imageIndex === index ? 1 : 0 }} transition={{ duration: 0.8 }}>
            <MediaImage src={image} alt="" fill sizes="(max-width: 1024px) 92vw, 0px" loading="eager" className="object-contain drop-shadow-2xl" />
          </motion.div>
        ) : null,
      )}
    </div>
  );
}
