"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { getAdminCategories } from "@/lib/api/categories";
import { deleteProduct, getAdminProducts, updateProduct, type ProductSort } from "@/lib/api/products";
import { errorMessage } from "@/lib/api/client";
import { categoryKeys } from "@/lib/queries/categories";
import { productKeys } from "@/lib/queries/products";
import type { Product, ProductStatus } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductTable } from "./product-table";

const PAGE_SIZE = 10;
const selectClass = "h-11 rounded-sm border border-border bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function AdminProductsList() {
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get("status");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState(searchParams.get("category") ?? "");
    const [status, setStatus] = useState<ProductStatus | "">(initialStatus === "DRAFT" || initialStatus === "PUBLISHED" ? initialStatus : "");
    const [sort, setSort] = useState<ProductSort>("createdAt_desc");
    const [page, setPage] = useState(1);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    const params = { page, limit: PAGE_SIZE, search: search || undefined, categoryId: category || undefined, status: status || undefined, sort };
    const products = useQuery({ queryKey: productKeys.adminList(params), queryFn: () => getAdminProducts(params), placeholderData: keepPreviousData });
    const categories = useQuery({ queryKey: categoryKeys.adminList(), queryFn: getAdminCategories });

    const refresh = () => queryClient.invalidateQueries({ queryKey: productKeys.all });
    const remove = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => { void refresh(); toast.success("Product deleted"); setProductToDelete(null); },
        onError: (error) => { setProductToDelete(null); toast.error(errorMessage(error, "Could not delete product")); },
    });
    const patch = useMutation({
        mutationFn: ({ id, changes }: { id: string; changes: { status?: ProductStatus; featured?: boolean } }) => updateProduct(id, changes),
        onSuccess: (product) => { void refresh(); toast.success(`${product.name} updated`); },
        onError: (error) => toast.error(errorMessage(error, "Could not update product")),
    });

    const result = products.data;
    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div><p className="text-sm font-medium text-brand">Catalog</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Products</h1><p className="mt-2 text-sm text-muted">Search, review, and curate the products customers see.</p></div>
                    <Button href="/admin/products/new"><Plus className="h-4 w-4" aria-hidden="true" /> Add product</Button>
                </div>
                <Card><CardContent className="space-y-5 p-4 md:p-6">
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" /><Input aria-label="Search products" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by name or description..." className="pl-9" /></div>
                        <select aria-label="Filter by category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className={selectClass}><option value="">All categories</option>{categories.data?.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select>
                        <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value as ProductStatus | ""); setPage(1); }} className={selectClass}><option value="">All statuses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select>
                        <select aria-label="Sort products" value={sort} onChange={(event) => { setSort(event.target.value as ProductSort); setPage(1); }} className={selectClass}><option value="createdAt_desc">Newest</option><option value="createdAt_asc">Oldest</option><option value="name_asc">Name A to Z</option><option value="name_desc">Name Z to A</option></select>
                    </div>
                    {products.isLoading && <div className="space-y-3">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div>}
                    {products.isError && <ErrorState onRetry={() => void products.refetch()} />}
                    {result && result.data.length === 0 && <EmptyState title="No products found" description="Try a different search or add your first product." actionLabel="Add product" actionHref="/admin/products/new" />}
                    {result && result.data.length > 0 && <ProductTable products={result.data} categories={categories.data} busy={products.isPlaceholderData || patch.isPending} onToggleStatus={(product) => patch.mutate({ id: product.id, changes: { status: product.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" } })} onToggleFeatured={(product) => patch.mutate({ id: product.id, changes: { featured: !product.featured } })} onDelete={setProductToDelete} />}
                    {result && <div className="flex flex-col items-center gap-3"><Pagination currentPage={result.meta.page} totalPages={result.meta.totalPages} onPageChange={setPage} /><p className="text-xs text-muted">{result.meta.total} {result.meta.total === 1 ? "product" : "products"} in total</p></div>}
                </CardContent></Card>
            </motion.div>
            <Dialog isOpen={Boolean(productToDelete)} onClose={() => setProductToDelete(null)} title="Delete product">
                <div className="space-y-5">
                    <p className="text-sm leading-6 text-muted">This will permanently remove <span className="font-semibold text-default">{productToDelete?.name}</span> and its images. If customers have already requested quotes for it, it cannot be deleted. Set it to draft to hide it instead.</p>
                    <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setProductToDelete(null)}>Cancel</Button><Button variant="destructive" isLoading={remove.isPending} onClick={() => productToDelete && remove.mutate(productToDelete.id)}>Delete product</Button></div>
                </div>
            </Dialog>
        </>
    );
}
