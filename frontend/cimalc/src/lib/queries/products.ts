export const productKeys = {
  all: ["products"] as const,
  list: (params: object) => [...productKeys.all, "list", params] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  newArrivals: () => [...productKeys.all, "new-arrivals"] as const,
  related: (slug: string) => [...productKeys.all, "related", slug] as const,
  detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
  byCategory: (categorySlug: string) => [...productKeys.all, "category", categorySlug] as const,
  menu: () => [...productKeys.all, "menu"] as const,
  adminList: (params: object) => [...productKeys.all, "admin-list", params] as const,
  adminDetail: (id: string) => [...productKeys.all, "admin-detail", id] as const,
};
