"use client";

import { use, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCategoryBySlug } from "@/lib/api/categories";
import { getProductsByCategory } from "@/lib/api/products";
import { categoryKeys } from "@/lib/queries/categories";
import { productKeys } from "@/lib/queries/products";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 12;

export default function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [page, setPage] = useState(1);

    const { data: category, isLoading: isCategoryLoading, isError: isCategoryError } = useQuery({
        queryKey: categoryKeys.detail(slug),
        queryFn: () => getCategoryBySlug(slug),
        retry: false,
    });

    const query = { page, limit: PAGE_SIZE };
    const { data: products, isLoading: isProductsLoading, isPlaceholderData } = useQuery({
        queryKey: [...productKeys.byCategory(slug), query],
        queryFn: () => getProductsByCategory(slug, query),
        enabled: !!category,
        placeholderData: keepPreviousData,
    });

    if (isCategoryLoading) {
        return <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8"><Skeleton className="h-6 w-48" /></div>;
    }
    if (isCategoryError || !category) {
        return <div className="mx-auto max-w-[1440px] px-4 py-16 md:px-8"><ErrorState title="Category not found" description="This category doesn't exist or may have been removed." /></div>;
    }

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories", href: "/categories" }, { label: category.name }]} />
            <div className="mb-8 mt-4 max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-brand">Explore the collection</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-default">{category.name}</h1>
                <p className="mt-3 text-sm leading-6 text-muted">{category.description ?? "Explore products selected to help you find the right fit, then request a tailored quote."}</p>
            </div>
            {isProductsLoading && <ProductGridSkeleton />}
            {products && products.data.length === 0 && <EmptyState title="No products in this category yet" actionLabel="Browse all products" actionHref="/products" />}
            {products && products.data.length > 0 && (
                <div className="flex flex-col gap-8">
                    <div className={isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}><ProductGrid products={products.data} /></div>
                    <Pagination currentPage={products.meta.page} totalPages={products.meta.totalPages} onPageChange={setPage} />
                </div>
            )}
        </div>
    );
}
