"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/lib/api/categories";
import { errorMessage } from "@/lib/api/client";
import { categoryKeys } from "@/lib/queries/categories";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import type { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CategoryForm({ category }: { category?: Category }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm<CategoryInput>({ resolver: zodResolver(categorySchema), defaultValues: { name: category?.name ?? "", description: category?.description ?? "" } });
    const mutation = useMutation({
        mutationFn: (input: CategoryInput) => (category ? updateCategory(category.id, input) : createCategory(input)),
        onSuccess: () => { void queryClient.invalidateQueries({ queryKey: categoryKeys.all }); toast.success(category ? "Category updated" : "Category created"); router.push("/admin/categories"); },
        onError: (error) => toast.error(errorMessage(error, "We couldn't save this category. Try again.")),
    });

    return (
        <motion.form initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate className="max-w-3xl">
            <Card><CardContent className="space-y-6 p-5 md:p-8">
                <div><h2 className="text-lg font-semibold text-default">Category information</h2><p className="mt-1 text-sm leading-6 text-muted">Give customers a useful label and a concise explanation of what belongs here. The web address stays the same when you rename a category.</p></div>
                <Input label="Category name" placeholder="e.g. Audio" error={errors.name?.message} {...register("name")} />
                <div className="space-y-2">
                    <label htmlFor="category-description" className="text-sm font-medium">Description (optional)</label>
                    <textarea id="category-description" rows={6} className="w-full rounded-sm border border-border bg-surface px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" placeholder="Help customers understand what they will find here..." {...register("description")} />
                    {errors.description && <p className="text-xs text-error">{errors.description.message}</p>}
                </div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" isLoading={mutation.isPending}>{category ? "Save changes" : "Create category"}</Button>
                </div>
            </CardContent></Card>
        </motion.form>
    );
}
