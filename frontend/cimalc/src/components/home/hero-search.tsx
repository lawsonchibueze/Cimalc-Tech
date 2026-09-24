"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";

/** Search bar for the hero. Sends the visitor to the products page with their search applied. */
export function HeroSearch() {
  const router = useRouter();
  const [term, setTerm] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = term.trim();
    router.push(value ? `/products?search=${encodeURIComponent(value)}` : "/products");
  }

  // The bar is white in both themes, so its text colours are fixed rather than themed.
  return (
    <form onSubmit={submit} role="search" className="flex w-full max-w-2xl flex-col gap-2 rounded-md bg-white p-2 shadow-2xl shadow-black/30 sm:flex-row">
      <label htmlFor="hero-search" className="sr-only">Search products</label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        <input id="hero-search" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="What are you looking for?" className="h-12 w-full rounded-sm bg-transparent pl-11 pr-3 text-base text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" />
      </div>
      <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
        Find products <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
