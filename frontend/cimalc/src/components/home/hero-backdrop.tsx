"use client";
import { motion } from "motion/react";
import { MediaImage } from "@/components/ui/media-image";

interface HeroBackdropProps {
  image?: string;
  active: boolean;
  reducedMotion: boolean;
}

/**
 * Photo layers for one slide. Product photos are usually square, so stretching
 * one across the whole banner would crop it into a blur. Instead the picture
 * appears three ways: as blurred colour behind everything, as a top banner on
 * phones and tablets, and as a sharp, uncropped image on the right of wide screens.
 *
 * Every slide stays mounted and only fades, so the next picture is already
 * loaded when it is shown and never pops in late.
 */
export function HeroBackdrop({ image, active, reducedMotion }: HeroBackdropProps) {
  return (
    <motion.div className="absolute inset-0" initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: 1 }} aria-hidden="true">
      {image ? (
        <>
          <div className="absolute inset-0 scale-125 opacity-70 blur-3xl">
            <MediaImage src={image} alt="" fill sizes="25vw" loading="eager" className="object-cover" />
          </div>
          <div className="absolute inset-x-0 top-0 h-[62%] opacity-80 [mask-image:linear-gradient(to_bottom,black_50%,transparent)] lg:hidden">
            <MediaImage src={image} alt="" fill sizes="100vw" loading="eager" className="object-cover" />
          </div>
          <div className="absolute inset-y-0 right-0 hidden w-[46%] [mask-image:linear-gradient(to_right,transparent,black_30%)] lg:block xl:w-[56%]">
            <motion.div className="absolute inset-0" initial={false} animate={{ scale: active && !reducedMotion ? 1.07 : 1 }} transition={{ duration: 14, ease: "linear" }}>
              <MediaImage src={image} alt="" fill sizes="56vw" loading="eager" className="object-contain object-right saturate-110" />
            </motion.div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand to-black/40" />
      )}
    </motion.div>
  );
}
