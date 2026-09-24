"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct, getProductById, updateProduct } from "@/lib/api/products";
import { errorMessage } from "@/lib/api/client";
import { productKeys } from "@/lib/queries/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductGallery } from "@/components/product/product-gallery";

export default function ProductDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const query = useQuery({ queryKey: productKeys.adminDetail(id), queryFn: () => getProductById(id), enabled: Boolean(id) });

    const toggle = useMutation({
        mutationFn: (status: "DRAFT" | "PUBLISHED") => updateProduct(id, { status }),
        onSuccess: (product) => { void queryClient.invalidateQueries({ queryKey: productKeys.all }); toast.success(product.status === "PUBLISHED" ? "Product published" : "Product moved to drafts"); },
        onError: (error) => toast.error(errorMessage(error)),
    });
    const remove = useMutation({
        mutationFn: () => deleteProduct(id),
        onSuccess: () => { void queryClient.invalidateQueries({ queryKey: productKeys.all }); toast.success("Product deleted"); router.push("/admin/products"); },
        onError: (error) => { setConfirmDelete(false); toast.error(errorMessage(error, "Could not delete product")); },
    });

    if (query.isLoading) return <Skeleton className="h-96 w-full" />;
    if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
    const product = query.data;
    const published = product.status === "PUBLISHED";

    return (
        <div className="space-y-6">
            <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: product.name }]} />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-sm font-medium text-brand">Product details</p><h1 className="mt-1 text-3xl font-bold">{product.name}</h1></div>
                <div className="flex flex-wrap gap-2">
                    {published && <Button href={`/products/${product.slug}`} variant="secondary" size="sm"><ExternalLink className="h-4 w-4" aria-hidden="true" />View on storefront</Button>}
                    <Button variant="secondary" size="sm" isLoading={toggle.isPending} onClick={() => toggle.mutate(published ? "DRAFT" : "PUBLISHED")}>{published ? <><EyeOff className="h-4 w-4" aria-hidden="true" />Unpublish</> : <><Eye className="h-4 w-4" aria-hidden="true" />Publish</>}</Button>
                    <Button href={`/admin/products/${product.id}/edit`} size="sm">Edit product</Button>
                    <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>Delete</Button>
                </div>
            </div>
            <Card><CardContent className="grid gap-8 p-5 md:grid-cols-[320px_1fr] md:p-8">
                <ProductGallery images={product.images} />
                <div className="space-y-6">
                    <div><p className="text-sm text-muted">Description</p><p className="mt-2 whitespace-pre-line leading-7">{product.description || "No description yet."}</p></div>
                    <dl className="grid gap-5 sm:grid-cols-2">
                        <div><dt className="text-sm text-muted">Category</dt><dd className="mt-1 font-semibold">{product.categoryName}</dd></div>
                        <div><dt className="text-sm text-muted">Visibility</dt><dd className="mt-1 flex flex-wrap gap-2"><Badge variant={published ? "success" : "warning"}>{published ? "Published" : "Draft"}</Badge>{product.featured && <Badge variant="info">Featured</Badge>}</dd></div>
                        <div><dt className="text-sm text-muted">Stock</dt><dd className="mt-1"><Badge variant={product.inStock ? "success" : "neutral"}>{product.inStock ? `${product.stock} in stock` : "Out of stock"}</Badge></dd></div>
                        <div><dt className="text-sm text-muted">Web address</dt><dd className="mt-1 font-mono text-sm">/products/{product.slug}</dd></div>
                        <div><dt className="text-sm text-muted">Added</dt><dd className="mt-1 text-sm">{new Date(product.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}</dd></div>
                    </dl>
                    <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-medium text-brand"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to products</Link>
                </div>
            </CardContent></Card>
            <Dialog isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete product">
                <div className="space-y-5">
                    <p className="text-sm leading-6 text-muted">This will permanently remove <span className="font-semibold text-default">{product.name}</span> and its images. Products with quote requests cannot be deleted. Set them to draft instead.</p>
                    <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button><Button variant="destructive" isLoading={remove.isPending} onClick={() => remove.mutate()}>Delete product</Button></div>
                </div>
            </Dialog>
        </div>
    );
}
