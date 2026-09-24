export const sessionKeys = { current: ["session"] as const };

export const quoteKeys = {
    mine: ["me", "quotes"] as const,
    mineDetail: (id: string) => ["me", "quotes", id] as const,
    admin: ["admin", "quotes"] as const,
    adminList: (params: object) => ["admin", "quotes", "list", params] as const,
    adminDetail: (id: string) => ["admin", "quotes", id] as const,
};

export const adminKeys = {
    stats: ["admin", "stats"] as const,
    users: (params: object) => ["admin", "users", params] as const,
    messages: (params: object) => ["admin", "messages", params] as const,
};
