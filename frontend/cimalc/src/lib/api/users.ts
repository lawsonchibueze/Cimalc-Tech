import type { PageMeta, Paginated } from "@/types/pagination";
import type { AdminUser, SessionUser, UserRole } from "@/types/user";
import { apiRequest, toQueryString } from "./client";

export function updateMyProfile(input: { name: string }) {
    return apiRequest<SessionUser>("/me", { method: "PATCH", body: JSON.stringify(input) });
}

export function getAdminUsers(params: { page?: number; limit?: number; search?: string; role?: UserRole } = {}) {
    return apiRequest<Paginated<AdminUser, PageMeta>>(`/admin/users${toQueryString({ ...params })}`);
}

export function updateAdminUser(id: string, input: { role?: UserRole; name?: string }) {
    return apiRequest<AdminUser>(`/admin/users/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
}
