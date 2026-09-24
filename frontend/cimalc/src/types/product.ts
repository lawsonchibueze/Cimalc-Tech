export type ProductStatus = "DRAFT" | "PUBLISHED";

export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    storageKey?: string;
}

export interface ProductVariant {
    id: string;
    name: string;
    stock: number;
    availability: boolean;
    attributes: Record<string, string>;
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    categorySlug: string;
    categoryName: string;
    images: ProductImage[];
    inStock: boolean;
    stock: number;
    status: ProductStatus;
    featured: boolean;
    variants: ProductVariant[];
    createdAt: string;
}
