export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    storageKey?: string;
}

export interface ProductSpecification {
    label: string;
    value: string;
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    categorySlug: string;
    images: ProductImage[];
    inStock: boolean;
    specifications?: ProductSpecification[];
}

