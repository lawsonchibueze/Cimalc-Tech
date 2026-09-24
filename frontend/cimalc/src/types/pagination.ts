export interface PageMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface Paginated<T, M extends PageMeta = PageMeta> {
    data: T[];
    meta: M;
}
