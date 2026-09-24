"use client";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedProducts } from "@/lib/api/products";
import { productKeys } from "@/lib/queries/products";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { ErrorState } from "@/components/ui/error-state";

const FEATURED_COUNT = 3;

export function FeaturedProducts() {
  const { data: products, isLoading, isError, refetch } = useQuery({ queryKey: productKeys.featured(), queryFn: () => getFeaturedProducts(FEATURED_COUNT) });

  // Nothing is featured until staff mark products as featured, so the section stays out of the way.
  if (!isLoading && !isError && !products?.length) return null;

  return (
    <section className="bg-surface py-16 text-default md:py-20">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Featured</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Picked by our team.</h2>
        </div>
        {isLoading && <ProductGridSkeleton count={FEATURED_COUNT} />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {products && <ProductGrid products={products} />}
      </div>
    </section>
  );
}
