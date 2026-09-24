"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/lib/api/products";
import { productKeys } from "@/lib/queries/products";
import { ProductForm } from "@/components/admin/product-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProductPage() {
    const { id } = useParams<{ id: string }>();
    const query = useQuery({ queryKey: productKeys.adminDetail(id), queryFn: () => getProductById(id), enabled: Boolean(id) });

    if (query.isLoading) return <Skeleton className="h-96 w-full" />;
    if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;

    return (
        <div className="space-y-6">
            <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: query.data.name, href: `/admin/products/${id}` }, { label: "Edit" }]} />
            <div><h1 className="text-3xl font-bold tracking-tight">Edit product</h1><p className="mt-2 text-sm text-muted">Refine the catalog information shown to customers.</p></div>
            <ProductForm key={query.data.id} product={query.data} />
        </div>
    );
}
