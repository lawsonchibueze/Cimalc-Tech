import { Phone } from "lucide-react";
import { BRAND_COLORS, GmailIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";
const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** One entry per channel, so the icon row and the detailed list always agree. */
function channels() {
  const { email, instagram, whatsapp, phone } = siteConfig;
  return [
    { key: "whatsapp", label: "WhatsApp", detail: phone.display, href: whatsapp.url, color: BRAND_COLORS.whatsapp, Icon: WhatsAppIcon, hint: "Chat on WhatsApp", newTab: true },
    { key: "email", label: "Email", detail: email, href: `mailto:${email}`, color: BRAND_COLORS.gmail, Icon: GmailIcon, hint: `Email ${email}`, newTab: false },
    { key: "instagram", label: "Instagram", detail: `@${instagram.handle}`, href: instagram.url, color: BRAND_COLORS.instagram, Icon: InstagramIcon, hint: `Follow @${instagram.handle} on Instagram`, newTab: true },
  ] as const;
}

/** Round icon buttons. Each icon is the link to that channel. */
export function ContactIconRow({ className }: { className?: string }) {
  return (
    <ul className={cn("flex items-center gap-3", className)} aria-label="Contact Cimalc Tech">
      {channels().map(({ key, hint, href, color, Icon, newTab }) => (
        <li key={key}>
          <a href={href} aria-label={hint} title={hint} {...(newTab ? external : {})} className={cn("grid h-11 w-11 place-items-center rounded-full border border-border bg-surface transition-transform hover:-translate-y-0.5 hover:bg-background", focusRing)} style={{ color }}>
            <Icon className="h-5 w-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Icon plus the readable address, number or handle, for pages with room to show them. */
export function ContactDetailList({ className }: { className?: string }) {
  const { phone } = siteConfig;
  return (
    <ul className={cn("space-y-4 text-sm", className)}>
      {channels().map(({ key, label, detail, href, color, Icon, newTab }) => (
        <li key={key}>
          <a href={href} {...(newTab ? external : {})} className={cn("group flex items-center gap-3 text-default", focusRing)}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface transition-transform group-hover:scale-105" style={{ color }}><Icon className="h-5 w-5" /></span>
            <span><span className="block text-xs text-muted">{label}</span><span className="font-medium group-hover:text-brand">{detail}</span></span>
          </a>
        </li>
      ))}
      <li>
        <a href={`tel:${phone.tel}`} className={cn("group flex items-center gap-3 text-default", focusRing)}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-brand transition-transform group-hover:scale-105"><Phone className="h-5 w-5" aria-hidden="true" /></span>
          <span><span className="block text-xs text-muted">Call</span><span className="font-medium group-hover:text-brand">{phone.display}</span></span>
        </a>
      </li>
    </ul>
  );
}
