"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProducts, type ProductSort } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { productKeys } from "@/lib/queries/products";
import { categoryKeys } from "@/lib/queries/categories";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 350;
const SORTS: Array<{ value: ProductSort; label: string }> = [
  { value: "createdAt_desc", label: "Newest" },
  { value: "createdAt_asc", label: "Oldest" },
  { value: "name_asc", label: "Name (A to Z)" },
  { value: "name_desc", label: "Name (Z to A)" },
];

function isSort(value: string | null): value is ProductSort {
  return SORTS.some((sort) => sort.value === value);
}

export default function ProductsBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters live in the URL, so a filtered view can be shared, bookmarked and reached with the back button.
  const urlSearch = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sortParam = searchParams.get("sort");
  const sort: ProductSort = isSort(sortParam) ? sortParam : "createdAt_desc";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  function update(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  // The box keeps what was typed. Typing is committed to the URL after a pause, and searches
  // started elsewhere, such as the header, replace the text only when they were not typed here.
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [committed, setCommitted] = useState(urlSearch);
  const [seenUrlSearch, setSeenUrlSearch] = useState(urlSearch);
  if (urlSearch !== seenUrlSearch) {
    setSeenUrlSearch(urlSearch);
    if (urlSearch !== committed) {
      setSearchInput(urlSearch);
      setCommitted(urlSearch);
    }
  }

  const trimmed = searchInput.trim();
  useEffect(() => {
    if (trimmed === committed) return;
    const timer = window.setTimeout(() => {
      setCommitted(trimmed);
      update({ search: trimmed || undefined, page: undefined });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, committed]);

  const params = { page, limit: PAGE_SIZE, search: urlSearch || undefined, categoryId: category || undefined, sort };
  const products = useQuery({ queryKey: productKeys.list(params), queryFn: () => getProducts(params), placeholderData: keepPreviousData });
  const categories = useQuery({ queryKey: categoryKeys.lists(), queryFn: getCategories });

  const result = products.data;
  const filtersActive = Boolean(urlSearch || category || sortParam);
  const radioClass = "flex min-h-11 items-center gap-2 text-sm text-default";

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:h-fit">
          <div>
            <label htmlFor="product-search" className="mb-2 block text-sm font-semibold text-default">Search</label>
            <Input id="product-search" placeholder="Search products…" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
          </div>
          <fieldset>
            <legend className="mb-2 block text-sm font-semibold text-default">Category</legend>
            <div className="flex flex-col gap-1">
              <label className={radioClass}><input type="radio" name="category" checked={!category} onChange={() => update({ category: undefined, page: undefined })} />All categories</label>
              {categories.data?.map((item) => (
                <label key={item.id} className={radioClass}>
                  <input type="radio" name="category" checked={category === item.slug} onChange={() => update({ category: item.slug, page: undefined })} />
                  {item.name} <span className="text-xs text-muted">{item.productCount}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="sort" className="mb-2 block text-sm font-semibold text-default">Sort by</label>
            <select id="sort" value={sort} onChange={(event) => update({ sort: event.target.value === "createdAt_desc" ? undefined : event.target.value, page: undefined })} className="h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
              {SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          {filtersActive && <Button variant="ghost" size="sm" className="self-start" onClick={() => { setSearchInput(""); setCommitted(""); router.replace(pathname, { scroll: false }); }}>Clear filters</Button>}
        </aside>
        <div className="flex flex-col gap-6">
          {result && <p className="text-sm text-muted" aria-live="polite">{result.meta.total} {result.meta.total === 1 ? "product" : "products"}</p>}
          {products.isLoading && <ProductGridSkeleton count={PAGE_SIZE} />}
          {products.isError && <ErrorState onRetry={() => products.refetch()} />}
          {result && result.data.length === 0 && <EmptyState title="No products found" description="Try adjusting your search or filters." />}
          {result && result.data.length > 0 && (
            <div className={products.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
              <ProductGrid products={result.data} />
            </div>
          )}
          {result && <Pagination currentPage={result.meta.page} totalPages={result.meta.totalPages} onPageChange={(next) => update({ page: next > 1 ? String(next) : undefined })} />}
        </div>
      </div>
    </div>
  );
}
