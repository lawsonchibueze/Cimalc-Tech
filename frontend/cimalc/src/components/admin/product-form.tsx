"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminCategories } from "@/lib/api/categories";
import { createProduct, updateProduct } from "@/lib/api/products";
import { deleteUpload } from "@/lib/api/uploads";
import { errorMessage } from "@/lib/api/client";
import { productKeys } from "@/lib/queries/products";
import { categoryKeys } from "@/lib/queries/categories";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProductImagesField } from "./product-images-field";

const fieldClass = "w-full rounded-sm border border-border bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

function defaultsFor(product?: Product): ProductInput {
    return {
        name: product?.name ?? "",
        slug: product?.slug ?? "",
        description: product?.description ?? "",
        categorySlug: product?.categorySlug ?? "",
        status: product?.status ?? "PUBLISHED",
        featured: product?.featured ?? false,
        stock: product?.stock ?? 0,
        images: product?.images.filter((image) => image.storageKey || !image.url.endsWith("placeholder.svg")) ?? [],
    };
}

export function ProductForm({ product }: { product?: Product }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const categories = useQuery({ queryKey: categoryKeys.adminList(), queryFn: getAdminCategories });
    // Mutated as files upload and are removed. It never drives rendering, so a plain Set held in state is enough.
    const [unsavedKeys] = useState(() => new Set<string>());
    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<ProductInput>({ resolver: zodResolver(productSchema), defaultValues: defaultsFor(product) });
    const images = useWatch({ control, name: "images" });

    const mutation = useMutation({
        mutationFn: (input: ProductInput) => (product ? updateProduct(product.id, input) : createProduct(input)),
        onSuccess: () => {
            unsavedKeys.clear();
            void queryClient.invalidateQueries({ queryKey: productKeys.all });
            void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            toast.success(product ? "Product updated" : "Product created");
            router.push("/admin/products");
        },
        onError: (error) => toast.error(errorMessage(error, "We couldn't save this product. Try again.")),
    });

    /** Files uploaded during this edit but never saved would otherwise stay in storage forever. */
    function cancel() {
        for (const key of unsavedKeys) void deleteUpload(key).catch(() => undefined);
        unsavedKeys.clear();
        router.back();
    }

    return (
        <motion.form initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <Card><CardContent className="space-y-5 p-5 md:p-6">
                <div><h2 className="text-lg font-semibold text-default">Product information</h2><p className="mt-1 text-sm text-muted">Keep the storefront copy clear, useful, and easy to scan.</p></div>
                <Input label="Product name" placeholder="e.g. AuraWave Pro Headphones" error={errors.name?.message} {...register("name")} />
                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <textarea id="description" rows={6} className={`${fieldClass} py-3`} placeholder="Describe the product's key benefit..." {...register("description")} />
                    {errors.description && <p className="text-xs text-error">{errors.description.message}</p>}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="categorySlug" className="text-sm font-medium">Category</label>
                        <select id="categorySlug" className={`${fieldClass} h-11`} {...register("categorySlug")}><option value="">Select category</option>{categories.data?.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select>
                        {errors.categorySlug && <p className="text-xs text-error">{errors.categorySlug.message}</p>}
                    </div>
                    <Input label="Stock quantity" type="number" min={0} step={1} inputMode="numeric" error={errors.stock?.message} {...register("stock", { valueAsNumber: true })} />
                </div>
                <Input label="URL slug" placeholder={product ? undefined : "Generated from the name"} hint={product ? "Changing this changes the product's web address, so old links stop working." : "Optional. Leave empty to generate it from the name."} error={errors.slug?.message} {...register("slug")} />
            </CardContent></Card>
            <div className="space-y-6">
                <Card><CardContent className="p-5">
                    <ProductImagesField images={images} onChange={(next) => setValue("images", next, { shouldValidate: true, shouldDirty: true })} productId={product?.id} unsavedKeys={unsavedKeys} error={errors.images?.message ?? errors.images?.root?.message} />
                </CardContent></Card>
                <Card><CardContent className="space-y-4 p-5">
                    <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium">Visibility</label>
                        <select id="status" className={`${fieldClass} h-11`} {...register("status")}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select>
                        <p className="text-xs text-muted">Draft products are hidden from the storefront.</p>
                    </div>
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-brand" {...register("featured")} /> Feature on the home page</label>
                    <Button type="submit" className="w-full" isLoading={mutation.isPending}>{product ? "Save changes" : "Create product"}</Button>
                    <Button type="button" variant="ghost" className="w-full" onClick={cancel}>Cancel</Button>
                </CardContent></Card>
            </div>
        </motion.form>
    );
}
