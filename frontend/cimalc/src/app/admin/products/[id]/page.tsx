"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/lib/api/products";
import { productKeys } from "@/lib/queries/products";
import { Button } from "@/components/ui/botton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({ queryKey: productKeys.adminDetail(id), queryFn: () => getProductById(id), enabled: Boolean(id) });
  if (query.isLoading) return <Skeleton className="h-96 w-full" />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const product = query.data;
  return <div className="space-y-6"><Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: product.name }]} /><div className="flex items-end justify-between"><div><p className="text-sm font-medium text-brand">Product details</p><h1 className="mt-1 text-3xl font-bold">{product.name}</h1></div><Button href={`/admin/products/${product.id}/edit`}>Edit product</Button></div><Card><CardContent className="grid gap-8 p-5 md:grid-cols-[280px_1fr] md:p-8"><img src={product.images[0]?.url ?? "/products/mock.png"} alt={product.images[0]?.alt ?? product.name} className="aspect-square w-full rounded-md object-cover" /><div className="space-y-6"><div><p className="text-sm text-muted">Description</p><p className="mt-2 leading-7">{product.description}</p></div><div className="grid gap-5 sm:grid-cols-2"><div><p className="text-sm text-muted">Category</p><p className="mt-1 font-semibold">{product.categorySlug}</p></div><div><p className="text-sm text-muted">Status</p><Badge variant={product.inStock ? "success" : "warning"}>{product.inStock ? "In stock" : "Out of stock"}</Badge></div></div><Link href="/admin/products" className="text-sm font-medium text-brand">← Back to products</Link></div></CardContent></Card></div>;
}
