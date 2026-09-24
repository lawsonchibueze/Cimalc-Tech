"use client";
import { motion } from "motion/react";
import { MediaImage } from "@/components/ui/media-image";

interface HeroBackdropProps {
  image?: string;
  active: boolean;
  reducedMotion: boolean;
}

/**
 * The slide's photo as a full-width background, softened with some transparency so the
 * page colour shows through and the headline stays readable. Every slide stays mounted
 * and only fades, so the next picture is already loaded when it appears.
 */
export function HeroBackdrop({ image, active, reducedMotion }: HeroBackdropProps) {
  return (
    <motion.div className="absolute inset-0" initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: 1 }} aria-hidden="true">
      {image ? (
        <motion.div className="absolute inset-0" initial={false} animate={{ scale: active && !reducedMotion ? 1.06 : 1 }} transition={{ duration: 14, ease: "linear" }}>
          <MediaImage src={image} alt="" fill sizes="100vw" loading="eager" className="object-cover object-center opacity-70" />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand to-black/40 dark:from-hero" />
      )}
    </motion.div>
  );
}
