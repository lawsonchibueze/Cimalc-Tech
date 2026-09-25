import Link from "next/link";
import { ArrowUpRight, LayoutDashboard, MessageCircle } from "lucide-react";
import { ContactIconRow } from "./contact-icons";
import { FooterAccountLinks } from "./footer-account-links";
import { SiteLogo } from "./site-logo";
import { siteConfig } from "@/lib/config/site";

const columns = [
  { title: "Explore", links: [{ href: "/products", label: "All products" }, { href: "/categories", label: "Categories" }, { href: "/faq", label: "FAQs" }] },
  { title: "Company", links: [{ href: "/about", label: "About Cimalc Tech" }, { href: "/contact", label: "Contact the team" }] },
];

const linkClass = "w-fit text-sm text-muted transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";
const pillClass = "inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-xs font-medium text-default transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function Footer() {
  const { phone, address } = siteConfig;
  return (
    <footer className="relative overflow-hidden border-t border-border bg-footer text-default">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
        <div className="mb-14 flex flex-col justify-between gap-6 rounded-xl border border-border bg-background/70 p-5 backdrop-blur md:flex-row md:items-center md:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Not sure where to start?</p>
            <h2 className="mt-2 text-xl font-bold md:text-2xl">Let’s find the right technology together.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Tell us what you need and our team will help you make a confident choice.</p>
          </div>
          <Link href="/contact" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-sm bg-brand px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Talk to our team <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="grid gap-10 md:grid-cols-[1.3fr_2fr] md:gap-16">
          <div>
            <Link href="/" aria-label="Cimalc Tech home" className="inline-flex rounded-lg bg-white p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><SiteLogo className="h-16 w-40" sizes="160px" /></Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-muted">Thoughtfully selected electronics, personalized guidance, and quote-first buying.</p>
            <div className="mt-5 space-y-2 text-sm leading-6 text-muted">
              <a href={`tel:${phone.tel}`} className="block transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{phone.display}</a>
              <p>{address.street},<br />{address.locality}, {address.region}.</p>
            </div>
            <div className="mt-6 space-y-4">
              <ContactIconRow />
              <Link href="/contact" className={pillClass}><MessageCircle className="h-4 w-4" aria-hidden="true" />Need help choosing?</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{column.title}</h3>
                <div className="mt-4 flex flex-col gap-3">{column.links.map((link) => <Link key={link.href} href={link.href} className={linkClass}>{link.label}</Link>)}</div>
              </div>
            ))}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Account</h3>
              <FooterAccountLinks />
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono">© {new Date().getFullYear()} {siteConfig.name}</span>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <span>Prices are confirmed through personalized quotes.</span>
            <Link href="/admin" className="inline-flex min-h-9 w-fit items-center gap-2 rounded-full border border-border px-3 font-medium text-default transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />Staff portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
