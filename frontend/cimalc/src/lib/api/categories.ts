import type { Category } from "@/types/category";
import type { CategoryInput } from "@/lib/validations/category";
import { apiRequest } from "./client";

interface BackendCategory {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    productCount: number;
    image: string | null;
}

function mapCategory(item: BackendCategory): Category {
    return {
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description ?? undefined,
        productCount: item.productCount,
        image: item.image ?? undefined,
    };
}

export async function getCategories() {
    return (await apiRequest<BackendCategory[]>("/categories")).map(mapCategory);
}

export async function getAdminCategories() {
    return (await apiRequest<BackendCategory[]>("/admin/categories")).map(mapCategory);
}

export async function getCategoryBySlug(slug: string) {
    return mapCategory(await apiRequest<BackendCategory>(`/categories/${encodeURIComponent(slug)}`));
}

export async function getCategoryById(id: string) {
    return mapCategory(await apiRequest<BackendCategory>(`/admin/categories/${encodeURIComponent(id)}`));
}

export async function createCategory(input: CategoryInput) {
    return mapCategory(await apiRequest<BackendCategory>("/admin/categories", { method: "POST", body: JSON.stringify(input) }));
}

export async function updateCategory(id: string, input: CategoryInput) {
    return mapCategory(await apiRequest<BackendCategory>(`/admin/categories/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) }));
}

export async function deleteCategory(id: string) {
    await apiRequest<unknown>(`/admin/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
}
