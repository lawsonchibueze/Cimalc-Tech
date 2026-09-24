import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

const promises = ["A considered range instead of endless scrolling", "Clear product details before you commit", "A real person when you want a second opinion"];

export default function AboutPage() {
  return <div>
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-12"><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />
        <div className="grid gap-12 py-16 md:grid-cols-[1.05fr_.95fr] md:items-end md:py-24">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">About Cimalc Tech</p><h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-default sm:text-5xl md:text-7xl">Good technology should feel easier to choose.</h1></div>
          <div className="max-w-xl md:pb-2"><p className="text-lg leading-8 text-muted">We started Cimalc Tech because buying electronics often feels like too much noise, too many tabs, and not enough useful advice.</p><p className="mt-5 text-base leading-7 text-muted">So we are building a calmer way to shop: a carefully selected range, honest detail, and a team you can talk to before requesting a quote.</p></div>
        </div>
      </div>
    </section>
    <section className="mx-auto grid max-w-[1440px] gap-12 px-4 py-16 md:grid-cols-[.8fr_1.2fr] md:px-8 md:py-24">
      <div><p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Why we do it</p><p className="mt-5 text-3xl font-semibold leading-tight text-default md:text-4xl">Not every purchase needs a hard sell.</p><p className="mt-6 text-base leading-7 text-muted">Sometimes you know exactly what you want. Sometimes you know the problem, but not the product. We make room for both.</p></div>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-10"><p className="text-2xl font-semibold leading-relaxed text-default md:text-3xl">“Tell us what you need it to do. We’ll help you work out what makes sense.”</p><div className="mt-8 flex items-center gap-3 border-t border-border pt-5"><span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-bold text-white">C</span><div><p className="text-sm font-semibold text-default">The Cimalc Tech team</p><p className="text-xs text-muted">Here when you need a second opinion</p></div></div></div>
    </section>
    <section className="bg-surface">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 md:grid-cols-[.8fr_1.2fr] md:px-8 md:py-24"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">What you can expect</p><h2 className="mt-4 text-3xl font-bold tracking-tight text-default md:text-5xl">A more considered way to buy.</h2></div><div className="divide-y divide-border border-y border-border">{promises.map((promise) => <div key={promise} className="flex items-center gap-4 py-5 text-base text-default"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent"><Check className="h-4 w-4" aria-hidden="true" /></span>{promise}</div>)}</div></div>
    </section>
    <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24"><div className="rounded-2xl bg-brand p-7 text-white md:p-12"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Start wherever you are</p><h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">Have a setup in mind?</h2><p className="mt-4 max-w-xl text-base leading-7 text-white/75">Browse the range, send us what you are considering, or speak with the team. There is no pressure to know all the answers first.</p></div><div className="flex flex-col gap-3 sm:flex-row"><Button href="/products" variant="secondary" size="lg">Browse products <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button><Link href="/contact" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-sm px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Talk to our team <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div></div></div></section>
  </div>;
}

