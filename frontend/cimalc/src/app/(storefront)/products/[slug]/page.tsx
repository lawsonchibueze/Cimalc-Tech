"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductBySlug, getRelatedProducts } from "@/lib/api/products";
import { productKeys } from "@/lib/queries/products";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { RequestQuoteDialog } from "@/components/product/request-quote-dialog";
import { Button } from "@/components/ui/button";
import { RecentlyViewedProducts } from "@/components/product/recently-viewed-products";
import type { ProductVariant } from "@/types/product";

const RELATED_COUNT = 3;

function VariantRow({ variant, first }: { variant: ProductVariant; first: boolean }) {
    const attributes = Object.entries(variant.attributes);
    return (
        <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm ${first ? "" : "border-t border-border"}`}>
            <div>
                <p className="font-medium text-default">{variant.name}</p>
                {attributes.length > 0 && <p className="mt-1 text-muted">{attributes.map(([key, value]) => `${key}: ${value}`).join(" · ")}</p>}
            </div>
            <Badge variant={variant.availability ? "success" : "neutral"}>{variant.availability ? "Available" : "Out of stock"}</Badge>
        </div>
    );
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);

    const { data: product, isLoading, isError } = useQuery({
        queryKey: productKeys.detail(slug),
        queryFn: () => getProductBySlug(slug),
        retry: false,
    });

    const { data: related } = useQuery({
        queryKey: productKeys.related(slug),
        queryFn: () => getRelatedProducts(slug, RELATED_COUNT),
        enabled: !!product,
    });

    if (isLoading) {
        return (
            <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_420px]">
                    <Skeleton className="aspect-square w-full" />
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="mx-auto max-w-[1440px] px-4 py-16 md:px-8">
                <ErrorState title="Product not found" description="This product doesn't exist or may have been removed." />
                <div className="mt-6 flex justify-center">
                    <Button href="/products" variant="secondary">Back to Products</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.categoryName, href: `/categories/${product.categorySlug}` }, { label: product.name }]} />
            <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-[1fr_420px]">
                <ProductGallery images={product.images} />
                <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/categories/${product.categorySlug}`} className="text-xs font-semibold uppercase tracking-[0.14em] text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{product.categoryName}</Link>
                        {!product.inStock && <Badge variant="neutral">Out of stock</Badge>}
                    </div>
                    <h1 className="text-2xl font-bold text-default">{product.name}</h1>
                    {product.description && <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{product.description}</p>}
                    <div className="rounded-md border border-brand/15 bg-brand/[0.04] p-4">
                        <p className="text-sm font-semibold text-brand">Get a tailored quote</p>
                        <p className="mt-1 text-sm leading-5 text-muted">Tell us what you need and we’ll confirm current availability and the best available pricing.</p>
                    </div>
                    <Button size="lg" variant="primary" onClick={() => setIsQuoteOpen(true)}>Request a Quote</Button>
                    <p className="text-xs text-muted">{product.inStock ? "No payment is required to request a quote." : "Out of stock right now. You can still request a quote and we’ll confirm when it can be sourced."}</p>
                </div>
            </div>
            {product.variants.length > 0 && (
                <section className="mt-16 max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Choices</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-default">Available options</h2>
                    <div className="mt-6 overflow-hidden rounded-md border border-border bg-surface">
                        {product.variants.map((variant, index) => <VariantRow key={variant.id} variant={variant} first={index === 0} />)}
                    </div>
                </section>
            )}
            {related && related.length > 0 && (
                <section className="mt-16">
                    <h2 className="mb-6 text-xl font-bold text-default">Related Products</h2>
                    <ProductGrid products={related} />
                </section>
            )}
            <RecentlyViewedProducts slug={product.slug} />
            <section className="mt-16 rounded-md bg-brand p-6 text-white md:flex md:items-center md:justify-between md:gap-8 md:p-10">
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">Need a second opinion?</p>
                    <h2 className="mt-2 text-xl font-bold">We can help you choose.</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Tell us about your use case, quantity, or budget and our team can point you toward the right option.</p>
                </div>
                <Button href="/contact" variant="secondary" size="lg" className="mt-5 shrink-0 md:mt-0">Talk to our team</Button>
            </section>
            <RequestQuoteDialog isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} productId={product.id} productName={product.name} inStock={product.inStock} />
        </div>
    );
}
