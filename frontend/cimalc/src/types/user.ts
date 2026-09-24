export type UserRole = "USER" | "ADMIN";

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    emailVerified?: boolean;
    role?: UserRole;
}

export interface AdminUser extends SessionUser {
    role: UserRole;
    createdAt: string;
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    handledAt: string | null;
    createdAt: string;
}
