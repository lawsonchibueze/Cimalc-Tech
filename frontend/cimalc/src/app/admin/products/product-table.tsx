"use client";

import Link from "next/link";
import { Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { PLACEHOLDER_IMAGE } from "@/lib/media/image";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductTableProps {
    products: Product[];
    categories: Category[] | undefined;
    busy: boolean;
    onToggleStatus: (product: Product) => void;
    onToggleFeatured: (product: Product) => void;
    onDelete: (product: Product) => void;
}

const iconButton = "h-11 w-11 p-0";

export function ProductTable({ products, categories, busy, onToggleStatus, onToggleFeatured, onDelete }: ProductTableProps) {
    return (
        <div className={cn("overflow-x-auto transition-opacity", busy && "opacity-60")}>
            <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                        <th className="px-3 py-3 font-semibold">Image</th>
                        <th className="px-3 py-3 font-semibold">Name</th>
                        <th className="px-3 py-3 font-semibold">Category</th>
                        <th className="px-3 py-3 font-semibold">Status</th>
                        <th className="px-3 py-3 font-semibold">Stock</th>
                        <th className="px-3 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => {
                        const published = product.status === "PUBLISHED";
                        return (
                            <tr key={product.id} className="border-b border-border/70 last:border-0 hover:bg-background">
                                <td className="px-3 py-4"><span className="relative block h-12 w-12 overflow-hidden rounded-sm bg-background"><MediaImage src={product.images[0]?.url ?? PLACEHOLDER_IMAGE} alt="" fill sizes="48px" className="object-cover" /></span></td>
                                <td className="px-3 py-4">
                                    <Link className="font-medium text-default hover:text-brand" href={`/admin/products/${product.id}`}>{product.name}</Link>
                                    <p className="text-xs text-muted">/{product.slug}</p>
                                </td>
                                <td className="px-3 py-4">{categories?.find((item) => item.slug === product.categorySlug)?.name ?? product.categoryName}</td>
                                <td className="px-3 py-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant={published ? "success" : "warning"}>{published ? "Published" : "Draft"}</Badge>
                                        {product.featured && <Badge variant="info">Featured</Badge>}
                                    </div>
                                </td>
                                <td className="px-3 py-4"><Badge variant={product.inStock ? "success" : "neutral"}>{product.inStock ? `${product.stock} in stock` : "Out of stock"}</Badge></td>
                                <td className="px-3 py-4">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="sm" className={iconButton} aria-label={published ? `Unpublish ${product.name}` : `Publish ${product.name}`} title={published ? "Unpublish" : "Publish"} onClick={() => onToggleStatus(product)}>{published ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}</Button>
                                        <Button variant="ghost" size="sm" className={iconButton} aria-label={product.featured ? `Remove ${product.name} from featured` : `Feature ${product.name}`} aria-pressed={product.featured} title={product.featured ? "Remove from featured" : "Feature on home page"} onClick={() => onToggleFeatured(product)}><Star className={cn("h-4 w-4", product.featured && "fill-current")} aria-hidden="true" /></Button>
                                        <Button href={`/admin/products/${product.id}/edit`} variant="ghost" size="sm">Edit</Button>
                                        <Button variant="ghost" size="sm" className={cn(iconButton, "text-error")} aria-label={`Delete ${product.name}`} onClick={() => onDelete(product)}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
