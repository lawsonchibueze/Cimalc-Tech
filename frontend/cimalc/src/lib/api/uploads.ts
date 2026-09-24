import { apiRequest } from "./client";
import { validateImageFile } from "@/lib/config/upload";

type UploadResponse = { uploadUrl: string; key: string; publicUrl: string };
type ConfirmResponse = { key: string; publicUrl: string; contentType: string; size: number };

/**
 * Uploads straight to R2 with a presigned URL and asks the API to verify the
 * result. Throws a readable message for anything a person can fix.
 */
export async function uploadProductImage(file: File, productId?: string): Promise<ConfirmResponse> {
    const problem = validateImageFile(file);
    if (problem) throw new Error(problem);

    const presign = await apiRequest<UploadResponse>("/admin/uploads/presign", {
        method: "POST",
        body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size, ...(productId ? { productId } : { folder: "products" }) }),
    });

    let upload: Response;
    try {
        upload = await fetch(presign.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    } catch {
        throw new Error("The image could not reach storage. Check the R2 bucket CORS rules allow uploads from this site.");
    }
    if (!upload.ok) throw new Error(`Storage rejected the upload (${upload.status}).`);

    return apiRequest<ConfirmResponse>("/admin/uploads/confirm", {
        method: "POST",
        body: JSON.stringify({ key: presign.key, contentType: file.type, size: file.size }),
    });
}

export function deleteUpload(key: string) {
    return apiRequest<{ message: string }>(`/admin/uploads?key=${encodeURIComponent(key)}`, { method: "DELETE" });
}
