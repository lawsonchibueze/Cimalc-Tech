"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCategoryById } from "@/lib/api/categories";
import { categoryKeys } from "@/lib/queries/categories";
import { CategoryForm } from "@/components/admin/category-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditCategoryPage() {
    const { id } = useParams<{ id: string }>();
    const query = useQuery({ queryKey: categoryKeys.adminDetail(id), queryFn: () => getCategoryById(id), enabled: Boolean(id) });

    if (query.isLoading) return <Skeleton className="h-96 w-full" />;
    if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;

    return (
        <div className="space-y-6">
            <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Categories", href: "/admin/categories" }, { label: "Edit category" }]} />
            <div><h1 className="text-3xl font-bold tracking-tight">Edit category</h1><p className="mt-2 text-sm text-muted">Keep category language consistent and useful.</p></div>
            <CategoryForm category={query.data} />
        </div>
    );
}
