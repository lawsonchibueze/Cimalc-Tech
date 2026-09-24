import { apiRequest } from "./client";

export interface AdminStats {
    totalUsers: number;
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    outOfStockProducts: number;
    totalCategories: number;
    totalQuotes: number;
    pendingQuotes: number;
    acceptedQuotes: number;
    openContactMessages: number;
}

export function getAdminStats() {
    return apiRequest<AdminStats>("/admin/stats");
}
