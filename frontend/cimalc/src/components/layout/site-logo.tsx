import Image from "next/image";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

/** The logo is a large square PNG, so next/image serves a small optimised copy. */
export function SiteLogo({ className, sizes = "148px", eager = false }: { className?: string; sizes?: string; eager?: boolean }) {
  return (
    <span className={cn("relative block", className)}>
      <Image src={siteConfig.logo} alt={siteConfig.name} fill sizes={sizes} loading={eager ? "eager" : "lazy"} className="object-contain object-left" />
    </span>
  );
}
