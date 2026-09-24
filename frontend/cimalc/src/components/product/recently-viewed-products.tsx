"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useQueries } from "@tanstack/react-query";
import { getProductBySlug } from "@/lib/api/products";
import { productKeys } from "@/lib/queries/products";
import { ProductGrid } from "./product-grid";
import type { Product } from "@/types/product";

const STORAGE_KEY = "cimalc-recently-viewed-v2";
const REMEMBERED = 6;
const SHOWN = 3;

function read() {
    try {
        return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
    } catch {
        return "[]";
    }
}

function parse(raw: string): string[] {
    try {
        const value: unknown = JSON.parse(raw);
        return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    } catch {
        return [];
    }
}

function subscribe(callback: () => void) {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

/** Products this visitor looked at before, kept in the browser. Deleted or unpublished ones drop out on their own. */
export function RecentlyViewedProducts({ slug }: { slug: string }) {
    const raw = useSyncExternalStore(subscribe, read, () => "[]");
    const slugs = useMemo(() => parse(raw).filter((item) => item !== slug).slice(0, SHOWN), [raw, slug]);

    useEffect(() => {
        try {
            const next = [slug, ...parse(read()).filter((item) => item !== slug)].slice(0, REMEMBERED);
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
            // Storage can be unavailable, for example in private browsing. Recently viewed is optional.
        }
    }, [slug]);

    const products = useQueries({
        queries: slugs.map((item) => ({ queryKey: productKeys.detail(item), queryFn: () => getProductBySlug(item), retry: false })),
        combine: (results) => results.map((result) => result.data).filter((item): item is Product => Boolean(item)),
    });

    if (!products.length) return null;
    return <section className="mt-16 border-t border-border pt-12"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Keep exploring</p><h2 className="mb-6 mt-2 text-2xl font-bold tracking-tight text-default">Recently viewed</h2><ProductGrid products={products} /></section>;
}
