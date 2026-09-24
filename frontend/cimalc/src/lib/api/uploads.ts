import { apiRequest } from "./client";

type UploadResponse = { uploadUrl: string; key: string; publicUrl?: string };
type ConfirmResponse = { key: string; publicUrl: string; contentType: string; size: number };

export async function uploadProductImage(file: File, productId?: string) {
  const presign = await apiRequest<UploadResponse>("/admin/uploads/presign", {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size, productId }),
  });
  if (!presign.publicUrl) throw new Error("R2_PUBLIC_URL is not configured");
  const upload = await fetch(presign.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!upload.ok) throw new Error("Image upload failed");
  return apiRequest<ConfirmResponse>("/admin/uploads/confirm", {
    method: "POST",
    body: JSON.stringify({ key: presign.key, publicUrl: presign.publicUrl, contentType: file.type, size: file.size }),
  });
}

export function deleteUpload(key: string) {
  return apiRequest<{ message: string }>(`/admin/uploads/${encodeURIComponent(key)}`, { method: "DELETE" });
}
