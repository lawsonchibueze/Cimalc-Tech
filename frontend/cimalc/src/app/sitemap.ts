import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/config/site";
import { apiBaseUrl } from "@/lib/api/client";

const staticPages = ["", "/products", "/categories", "/about", "/contact", "/faq"];
const MAX_PRODUCT_PAGES = 20;

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { next: { revalidate: 3600 } });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    // The sitemap must still render when the API is unreachable, for example during a build.
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const categories = await fetchJson<Array<{ slug: string; updatedAt: string }>>("/categories");
  for (const category of categories ?? []) {
    entries.push({ url: absoluteUrl(`/categories/${category.slug}`), lastModified: category.updatedAt, changeFrequency: "weekly", priority: 0.6 });
  }

  for (let page = 1; page <= MAX_PRODUCT_PAGES; page += 1) {
    const result = await fetchJson<{ data: Array<{ slug: string; updatedAt: string }>; meta: { totalPages: number } }>(`/products?limit=100&page=${page}`);
    if (!result) break;
    for (const product of result.data) {
      entries.push({ url: absoluteUrl(`/products/${product.slug}`), lastModified: product.updatedAt, changeFrequency: "weekly", priority: 0.8 });
    }
    if (page >= result.meta.totalPages) break;
  }

  return entries;
}
