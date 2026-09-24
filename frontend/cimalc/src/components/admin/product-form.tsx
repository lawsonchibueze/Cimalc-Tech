"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/categories";
import { createProduct, updateProduct } from "@/lib/api/products";
import { uploadProductImage } from "@/lib/api/uploads";
import { productKeys } from "@/lib/queries/products";
import { categoryKeys } from "@/lib/queries/categories";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import type { Product, ProductImage } from "@/types/product";
import { Button } from "@/components/ui/botton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";


export function ProductForm({ product }: { product?: Product }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const categories = useQuery({ queryKey: categoryKeys.lists(), queryFn: getCategories });
    const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
    const { register, handleSubmit, formState: { errors } } = useForm<z.input<typeof productSchema>, unknown, ProductInput>({ resolver: zodResolver(productSchema), defaultValues: { name: product?.name ?? "", description: product?.description ?? "", categorySlug: product?.categorySlug ?? "", inStock: product?.inStock ?? true, images: product?.images ?? [] } });
    const mutation = useMutation({ mutationFn: (input: ProductInput) => product ? updateProduct(product.id, input) : createProduct(input), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: productKeys.all }); toast.success(product ? "Product updated" : "Product created"); router.push("/admin/products"); }, onError: () => toast.error("We couldn't save this product. Try again.") });

    async function addImages(event: React.ChangeEvent<HTMLInputElement>) { const files = Array.from(event.target.files ?? []).slice(0, 5 - images.length); event.target.value = ""; if (!files.length) return; try { const next = await Promise.all(files.map(async (file) => { const uploaded = await uploadProductImage(file, product?.id); return { id: uploaded.key, url: uploaded.publicUrl, storageKey: uploaded.key, alt: file.name.replace(/\.[^/.]+$/, "") }; })); setImages((current) => [...current, ...next].slice(0, 5)); toast.success("Images uploaded"); } catch { toast.error("Image upload failed. Check the R2 configuration and try again."); } }
    return <motion.form initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }} onSubmit={handleSubmit((data) => mutation.mutate({ ...data, images }))} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card><CardContent className="space-y-5 p-5 md:p-6">
            <div><h2 className="text-lg font-semibold text-default">Product information</h2><p className="mt-1 text-sm text-muted">Keep the storefront copy clear, useful, and easy to scan.</p></div>
            <div className="space-y-2"><label htmlFor="name" className="text-sm font-medium">Product name</label><Input id="name" placeholder="e.g. AuraWave Pro Headphones" error={errors.name?.message} {...register("name")} />{errors.name && <p className="text-xs text-error">{errors.name.message}</p>}</div>
            <div className="space-y-2"><label htmlFor="description" className="text-sm font-medium">Description</label><textarea id="description" rows={5} className="w-full rounded-sm border border-border bg-surface px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" placeholder="Describe the product's key benefit..." {...register("description")} />{errors.description && <p className="text-xs text-error">{errors.description.message}</p>}</div>
            <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="categorySlug" className="text-sm font-medium">Category</label><select id="categorySlug" className="h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" {...register("categorySlug")}><option value="">Select category</option>{categories.data?.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select>{errors.categorySlug && <p className="text-xs text-error">{errors.categorySlug.message}</p>}</div></div>
        </CardContent></Card>
        <div className="space-y-6"><Card><CardContent className="space-y-4 p-5"><div><h3 className="text-sm font-semibold">Product media</h3><p className="mt-1 text-xs leading-5 text-muted">Add up to 5 images. The first image is the primary image. R2 upload will connect when the media endpoint is ready.</p></div><div className="grid grid-cols-2 gap-3">{images.map((image, index) => <div key={image.id} className="group relative overflow-hidden rounded-md border border-border bg-background"><img src={image.url} alt={image.alt} className="aspect-square w-full object-cover" /><span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-1 text-[10px] font-medium text-white">{index === 0 ? "Primary" : index + 1}</span><button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => setImages((current) => current.filter((item) => item.id !== image.id))} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-lg text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Ã—</button></div>)}{images.length < 5 && <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-brand/30 bg-brand/[0.03] text-center text-xs font-medium text-brand transition-colors hover:bg-brand/[0.08] focus-within:ring-2 focus-within:ring-brand"><span className="text-2xl">+</span><span>Add image</span><input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" onChange={addImages} /></label>}</div></CardContent></Card><Card><CardContent className="space-y-4 p-5"><label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-brand" {...register("inStock")} /> Available in stock</label><Button type="submit" className="w-full" isLoading={mutation.isPending}>{product ? "Save changes" : "Create product"}</Button><Button type="button" variant="ghost" className="w-full" onClick={() => router.back()}>Cancel</Button></CardContent></Card></div>
    </motion.form>;
}

