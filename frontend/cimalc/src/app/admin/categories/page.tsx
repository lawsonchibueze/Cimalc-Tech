"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderTree, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAdminCategories, deleteCategory } from "@/lib/api/categories";
import { errorMessage } from "@/lib/api/client";
import { categoryKeys } from "@/lib/queries/categories";
import type { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCategoriesPage() {
    const [search, setSearch] = useState("");
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const queryClient = useQueryClient();
    const categories = useQuery({ queryKey: categoryKeys.adminList(), queryFn: getAdminCategories });
    const remove = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => { void queryClient.invalidateQueries({ queryKey: categoryKeys.all }); toast.success("Category deleted"); setCategoryToDelete(null); },
        // The API explains why, for example that the category still has products.
        onError: (error) => { setCategoryToDelete(null); toast.error(errorMessage(error, "Could not delete category")); },
    });
    const filtered = useMemo(() => (categories.data ?? []).filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [categories.data, search]);

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div><p className="text-sm font-medium text-brand">Catalog structure</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Categories</h1><p className="mt-2 text-sm text-muted">Organize products into simple paths customers can understand.</p></div>
                    <Button href="/admin/categories/new"><Plus className="h-4 w-4" aria-hidden="true" /> Add category</Button>
                </div>
                <Card><CardContent className="space-y-5 p-4 md:p-6">
                    <div className="relative max-w-xl"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" /><Input aria-label="Search categories" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories..." className="pl-9" /></div>
                    {categories.isLoading && <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-36 w-full" />)}</div>}
                    {categories.isError && <ErrorState onRetry={() => void categories.refetch()} />}
                    {categories.data && filtered.length === 0 && <EmptyState title="No categories found" description="Try a different search or create a new category." actionLabel="Add category" actionHref="/admin/categories/new" />}
                    {filtered.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filtered.map((category, index) => (
                                <motion.article key={category.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -3 }} className="group rounded-md border border-border bg-surface p-5 transition-shadow hover:shadow-md">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="grid h-11 w-11 place-items-center rounded-md bg-brand/10 text-brand"><FolderTree className="h-5 w-5" aria-hidden="true" /></div>
                                        <div className="flex gap-1">
                                            <Button href={`/admin/categories/${category.id}/edit`} variant="ghost" size="sm">Edit</Button>
                                            <Button variant="ghost" size="sm" className="h-11 w-11 p-0 text-error" aria-label={`Delete ${category.name}`} onClick={() => setCategoryToDelete(category)}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>
                                        </div>
                                    </div>
                                    <h2 className="mt-5 text-lg font-semibold text-default">{category.name}</h2>
                                    <p className="mt-2 min-h-10 text-sm leading-5 text-muted">{category.description ?? "No description yet."}</p>
                                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted">
                                        <Link href={`/admin/products?category=${category.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{category.productCount} {category.productCount === 1 ? "product" : "products"}</Link>
                                        <Link href={`/categories/${category.slug}`} className="font-medium text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">View storefront &nearr;</Link>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </CardContent></Card>
            </motion.div>
            <Dialog isOpen={Boolean(categoryToDelete)} onClose={() => setCategoryToDelete(null)} title="Delete category">
                <div className="space-y-5">
                    <p className="text-sm leading-6 text-muted">This will permanently remove <span className="font-semibold text-default">{categoryToDelete?.name}</span>. A category that still has products cannot be deleted. Move or delete those products first.</p>
                    <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setCategoryToDelete(null)}>Cancel</Button><Button variant="destructive" isLoading={remove.isPending} onClick={() => categoryToDelete && remove.mutate(categoryToDelete.id)}>Delete category</Button></div>
                </div>
            </Dialog>
        </>
    );
}
