"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { MediaImage } from "@/components/ui/media-image";
import { deleteUpload, uploadProductImage } from "@/lib/api/uploads";
import { errorMessage } from "@/lib/api/client";
import { IMAGE_ACCEPT, MAX_PRODUCT_IMAGES } from "@/lib/config/upload";
import type { ProductImage } from "@/types/product";

interface ProductImagesFieldProps {
    images: ProductImage[];
    onChange: (images: ProductImage[]) => void;
    productId?: string;
    /** Keys uploaded during this edit and not yet saved. The form deletes whatever is left if it is abandoned. */
    unsavedKeys: Set<string>;
    error?: string;
}

const iconButton = "grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-40";

export function ProductImagesField({ images, onChange, productId, unsavedKeys, error }: ProductImagesFieldProps) {
    const [uploading, setUploading] = useState(0);

    async function addImages(event: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []).slice(0, MAX_PRODUCT_IMAGES - images.length);
        event.target.value = "";
        if (!files.length) return;

        setUploading((count) => count + files.length);
        // Files upload side by side and each reports its own problem, so one bad file does not lose the rest.
        const results = await Promise.allSettled(files.map((file) => uploadProductImage(file, productId)));
        const added: ProductImage[] = [];
        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                unsavedKeys.add(result.value.key);
                added.push({ id: result.value.key, url: result.value.publicUrl, storageKey: result.value.key, alt: files[index].name.replace(/\.[^/.]+$/, "") });
            } else {
                toast.error(errorMessage(result.reason, `Could not upload ${files[index].name}.`));
            }
        });
        setUploading((count) => count - files.length);
        if (added.length) onChange([...images, ...added].slice(0, MAX_PRODUCT_IMAGES));
    }

    function remove(image: ProductImage) {
        onChange(images.filter((item) => item.id !== image.id));
        // A file that was never saved is safe to delete now. Saved files are removed by the API when the product is saved.
        if (image.storageKey && unsavedKeys.delete(image.storageKey)) void deleteUpload(image.storageKey).catch(() => undefined);
    }

    function move(index: number, offset: number) {
        const target = index + offset;
        if (target < 0 || target >= images.length) return;
        const next = [...images];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    }

    const makePrimary = (index: number) => onChange([images[index], ...images.filter((_, position) => position !== index)]);
    const setAlt = (index: number, alt: string) => onChange(images.map((image, position) => (position === index ? { ...image, alt } : image)));

    return (
        <div className="space-y-3">
            <div>
                <h3 className="text-sm font-semibold">Product media</h3>
                <p className="mt-1 text-xs leading-5 text-muted">Add up to {MAX_PRODUCT_IMAGES} images. The first image is the primary image shown on cards and in search results.</p>
            </div>
            <ul className="grid grid-cols-2 gap-3">
                {images.map((image, index) => (
                    <li key={image.id} className="space-y-2">
                        <div className="group relative overflow-hidden rounded-md border border-border bg-background">
                            <div className="relative aspect-square w-full"><MediaImage src={image.url} alt={image.alt} fill sizes="160px" className="object-cover" /></div>
                            <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-1 text-[10px] font-medium text-white">{index === 0 ? "Primary" : index + 1}</span>
                            <button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => remove(image)} className={`${iconButton} absolute right-2 top-2`}><X className="h-4 w-4" aria-hidden="true" /></button>
                            <div className="absolute inset-x-2 bottom-2 flex justify-between">
                                <button type="button" aria-label={`Move image ${index + 1} earlier`} disabled={index === 0} onClick={() => move(index, -1)} className={iconButton}><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
                                {index > 0 && <button type="button" aria-label={`Make image ${index + 1} primary`} onClick={() => makePrimary(index)} className={iconButton}><Star className="h-4 w-4" aria-hidden="true" /></button>}
                                <button type="button" aria-label={`Move image ${index + 1} later`} disabled={index === images.length - 1} onClick={() => move(index, 1)} className={iconButton}><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
                            </div>
                        </div>
                        <input aria-label={`Description of image ${index + 1}`} value={image.alt} onChange={(event) => setAlt(index, event.target.value)} maxLength={200} placeholder="Describe this image" className="h-9 w-full rounded-sm border border-border bg-surface px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" />
                    </li>
                ))}
                {Array.from({ length: uploading }).map((_, index) => (
                    <li key={`uploading-${index}`} className="grid aspect-square place-items-center rounded-md border border-dashed border-border bg-background text-xs text-muted" role="status"><span className="flex flex-col items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />Uploading…</span></li>
                ))}
                {images.length + uploading < MAX_PRODUCT_IMAGES && (
                    <li>
                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-brand/30 bg-brand/[0.03] text-center text-xs font-medium text-brand transition-colors hover:bg-brand/[0.08] focus-within:ring-2 focus-within:ring-brand">
                            <span className="text-2xl" aria-hidden="true">+</span><span>Add image</span>
                            <input type="file" accept={IMAGE_ACCEPT} multiple className="sr-only" onChange={addImages} />
                        </label>
                    </li>
                )}
            </ul>
            {error && <p role="alert" className="text-xs text-error">{error}</p>}
        </div>
    );
}
