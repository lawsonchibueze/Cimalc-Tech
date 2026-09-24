"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/categories";
import { categoryKeys } from "@/lib/queries/categories";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CategoryTile } from "@/components/category/category-tile";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const { data: categories, isLoading, isError, refetch } = useQuery({ queryKey: categoryKeys.lists(), queryFn: getCategories });

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
      <div className="mt-12 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Browse with intention</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Find your next essential.</h1>
        <p className="mt-4 text-base leading-7 text-muted">Start with a category, explore the details, and request a quote when something feels right.</p>
      </div>
      {isLoading && <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}</div>}
      {isError && <div className="mt-12"><ErrorState onRetry={() => refetch()} /></div>}
      {categories && categories.length === 0 && <div className="mt-12"><EmptyState title="No categories yet" description="Check back soon." /></div>}
      {categories && categories.length > 0 && (
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => <CategoryTile key={category.id} category={category} sizes="(max-width: 768px) 50vw, 25vw" />)}
        </div>
      )}
    </div>
  );
}
