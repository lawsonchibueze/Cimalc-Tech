import type { Paginated } from "@/types/pagination";
import type { Product, ProductStatus } from "@/types/product";
import type { ProductInput } from "@/lib/validations/product";
import { PLACEHOLDER_IMAGE } from "@/lib/media/image";
import { apiRequest, toQueryString } from "./client";

export type ProductSort = "createdAt_desc" | "createdAt_asc" | "name_asc" | "name_desc";

export interface ProductQuery {
    page?: number;
    limit?: number;
    search?: string;
    /** Category id or slug. */
    categoryId?: string;
    sort?: ProductSort;
}

export interface AdminProductQuery extends ProductQuery {
    status?: ProductStatus;
    featured?: boolean;
}

interface BackendProduct {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    status: ProductStatus;
    featured: boolean;
    stock: number;
    inStock: boolean;
    categorySlug: string;
    categoryName: string;
    images: Array<{ id: string; url: string; alt: string; key?: string }>;
    variants: Array<{ id: string; name: string; stock: number; availability: boolean; attributes: unknown }>;
    createdAt: string;
}

type BackendPage = { data: BackendProduct[]; meta: Paginated<Product>["meta"] };

function toAttributes(value: unknown): Record<string, string> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, String(entry)]));
}

export function mapProduct(item: BackendProduct): Product {
    const images = item.images.filter((image) => !image.url.startsWith("blob:"));
    return {
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description ?? "",
        categorySlug: item.categorySlug,
        categoryName: item.categoryName,
        images: images.length
            ? images.map((image) => ({ id: image.id, url: image.url, alt: image.alt || item.name, storageKey: image.key }))
            : [{ id: `${item.id}-placeholder`, url: PLACEHOLDER_IMAGE, alt: item.name }],
        inStock: item.inStock,
        stock: item.stock,
        status: item.status,
        featured: item.featured,
        variants: item.variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            stock: variant.stock,
            availability: variant.availability,
            attributes: toAttributes(variant.attributes),
        })),
        createdAt: item.createdAt,
    };
}

function mapPage(page: BackendPage): Paginated<Product> {
    return { data: page.data.map(mapProduct), meta: page.meta };
}

export async function getProducts(params: ProductQuery = {}) {
    return mapPage(await apiRequest<BackendPage>(`/products${toQueryString({ ...params })}`));
}

export async function getFeaturedProducts(limit = 4) {
    return mapPage(await apiRequest<BackendPage>(`/products/featured${toQueryString({ limit })}`)).data;
}

export async function getNewArrivals(limit = 4) {
    return mapPage(await apiRequest<BackendPage>(`/products/new-arrivals${toQueryString({ limit })}`)).data;
}

export async function getRelatedProducts(slug: string, limit = 4) {
    return mapPage(await apiRequest<BackendPage>(`/products/${encodeURIComponent(slug)}/related${toQueryString({ limit })}`)).data;
}

export async function getProductBySlug(slug: string) {
    return mapProduct(await apiRequest<BackendProduct>(`/products/${encodeURIComponent(slug)}`));
}

export function getProductsByCategory(slug: string, params: ProductQuery = {}) {
    return apiRequest<BackendPage>(`/categories/${encodeURIComponent(slug)}/products${toQueryString({ ...params })}`).then(mapPage);
}

export async function getAdminProducts(params: AdminProductQuery = {}) {
    return mapPage(await apiRequest<BackendPage>(`/admin/products${toQueryString({ ...params })}`));
}

export async function getProductById(id: string) {
    return mapProduct(await apiRequest<BackendProduct>(`/admin/products/${encodeURIComponent(id)}`));
}

/** Only fields that are present are sent, so a partial update never overwrites the rest. */
function toBackendProduct(input: Partial<ProductInput>) {
    return {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug ? { slug: input.slug } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.categorySlug !== undefined ? { categoryId: input.categorySlug } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.featured !== undefined ? { featured: input.featured } : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
        ...(input.images
            ? {
                  images: input.images.map((image, index) => ({
                      key: image.storageKey ?? image.url,
                      url: image.url,
                      alt: image.alt,
                      isPrimary: index === 0,
                      position: index,
                  })),
              }
            : {}),
    };
}

export async function createProduct(input: ProductInput) {
    return mapProduct(await apiRequest<BackendProduct>("/admin/products", { method: "POST", body: JSON.stringify(toBackendProduct(input)) }));
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
    return mapProduct(await apiRequest<BackendProduct>(`/admin/products/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(toBackendProduct(input)) }));
}

export async function deleteProduct(id: string) {
    await apiRequest<unknown>(`/admin/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}
