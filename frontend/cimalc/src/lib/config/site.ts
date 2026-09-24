/**
 * Single source for business details. Everything the storefront prints about
 * the company (footer, contact page, structured data, sitemap) reads from here.
 */
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const siteConfig = {
  name: "Cimalc Tech",
  url: siteUrl,
  tagline: "Technology, selected for you",
  description: "Phones, laptops, gadgets, accessories, and affordable repair services from Cimalc Tech in Ajah, Lagos.",
  shortDescription: "Explore thoughtfully selected electronics and request a tailored quote.",
  keywords: ["phones Lagos", "laptops Ajah", "gadgets Nigeria", "electronics repair Ajah", "Cimalc Tech", "accessories Lagos"],
  logo: "/brand/cimalc-logo.png",
  phone: { display: "+234 803 391 1760", tel: "+2348033911760" },
  /** Optional. The email button is hidden until a real address is configured. */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || undefined,
  address: {
    street: "Block F1, 446/447 HFP Eastline Shopping Complex, Abraham Adesanya",
    locality: "Ajah",
    region: "Lagos State",
    country: "NG",
  },
} as const;

export const mainNav = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
] as const;

export function absoluteUrl(path: string) {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
