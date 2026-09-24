/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Product } from "@/types/product";
import type { ProductInput } from "@/lib/validations/product";
import { apiRequest } from "./client";

type BackendProduct = Record<string, any>;
type ProductFilters = { page?: number; limit?: number; search?: string; categoryId?: string; sort?: string };
function buildProductQuery(params?: ProductFilters) { const query = new URLSearchParams(); for (const key of ["page", "limit", "search", "categoryId", "sort"] as const) { const value = params?.[key]; if (value !== undefined && value !== "") query.set(key, String(value)); } return query; }
const toSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
function mapProduct(item: BackendProduct): Product { const category = item.category ?? {}; const images = Array.isArray(item.images) ? item.images : item.image ? [{ id: String(item.id) + "-image", url: item.image, alt: item.name }] : [{ id: String(item.id) + "-placeholder", url: "/products/mock.png", alt: item.name }]; return { id: String(item.id), slug: item.slug ?? toSlug(item.name), name: item.name, description: item.description ?? "", categorySlug: item.categorySlug ?? category.slug ?? category.id ?? String(item.categoryId ?? ""), images: images.map((image: BackendProduct, index: number) => ({ id: String(image.id ?? index), url: image.url ?? image.publicUrl, alt: image.alt ?? item.name, storageKey: image.storageKey ?? image.key })), inStock: item.inStock !== undefined ? Boolean(item.inStock) : item.availability === "IN_STOCK" || Number(item.stock ?? 0) > 0, specifications: item.variants ?? item.specifications }; }
export async function getProducts(): Promise<Product[]> { const query = buildProductQuery(); const result = await apiRequest<BackendProduct[] | { data?: BackendProduct[]; items?: BackendProduct[] }>("/products" + (query.size ? "?" + query : "")); const items = Array.isArray(result) ? result : result.data ?? result.items ?? []; return items.map(mapProduct); }
export async function getAdminProducts(): Promise<Product[]> { const query = buildProductQuery(); const result = await apiRequest<BackendProduct[] | { data?: BackendProduct[]; items?: BackendProduct[] }>("/admin/products" + (query.size ? "?" + query : "")); const items = Array.isArray(result) ? result : result.data ?? result.items ?? []; return items.map(mapProduct); }
export async function getProductBySlug(slug: string): Promise<Product> { return mapProduct(await apiRequest<BackendProduct>("/products/" + slug)); }
export async function getProductsByCategory(slug: string): Promise<Product[]> { const result = await apiRequest<BackendProduct[] | { data?: BackendProduct[]; items?: BackendProduct[] }>("/categories/" + slug + "/products"); const items = Array.isArray(result) ? result : result.data ?? result.items ?? []; return items.map(mapProduct); }
export async function getFeaturedProducts(): Promise<Product[]> { const result = await apiRequest<BackendProduct[] | { data?: BackendProduct[]; items?: BackendProduct[] }>("/products/featured"); const items = Array.isArray(result) ? result : result.data ?? result.items ?? []; return items.map(mapProduct); }
export async function getNewArrivals(): Promise<Product[]> { const result = await apiRequest<BackendProduct[] | { data?: BackendProduct[]; items?: BackendProduct[] }>("/products/new-arrivals"); const items = Array.isArray(result) ? result : result.data ?? result.items ?? []; return items.map(mapProduct); }
export async function getProductById(id: string): Promise<Product> { return mapProduct(await apiRequest<BackendProduct>("/admin/products/" + id)); }
function toBackendProduct(input: ProductInput) {
    return {
        name: input.name,
        description: input.description,
        categoryId: input.categorySlug,
        images: input.images?.map((image, index) => ({
            key: image.storageKey ?? image.url,
            url: image.url,
            alt: image.alt,
            isPrimary: index === 0,
            position: index,
        })),
        stock: input.inStock ? 1 : 0,
        status: "DRAFT",
    };
}
export async function createProduct(input: ProductInput): Promise<Product> { return mapProduct(await apiRequest<BackendProduct>("/admin/products", { method: "POST", body: JSON.stringify(toBackendProduct(input)) })); }
export async function updateProduct(id: string, input: ProductInput): Promise<Product> { return mapProduct(await apiRequest<BackendProduct>("/admin/products/" + id, { method: "PATCH", body: JSON.stringify(toBackendProduct(input)) })); }
export async function deleteProduct(id: string): Promise<void> { await apiRequest<void>("/admin/products/" + id, { method: "DELETE" }); }

