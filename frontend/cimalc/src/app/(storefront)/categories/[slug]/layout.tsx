import type { Metadata } from "next";
import { loadCategory } from "@/lib/api/server";
import { absoluteUrl, siteConfig } from "@/lib/config/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = await loadCategory(slug);
  if (!category) return { title: "Category not found", robots: { index: false, follow: false } };

  const description = category.description ?? `Explore ${category.name} at ${siteConfig.name} and request a tailored quote.`;
  const image = absoluteUrl(category.image ?? siteConfig.logo);
  return {
    title: category.name,
    description,
    alternates: { canonical: absoluteUrl(`/categories/${category.slug}`) },
    openGraph: { title: `${category.name} | ${siteConfig.name}`, description, type: "website", images: [{ url: image, alt: category.name }] },
    twitter: { card: "summary_large_image", title: `${category.name} | ${siteConfig.name}`, description, images: [image] },
  };
}

export default async function CategorySlugLayout({ children, params }: { children: React.ReactNode } & Params) {
  const { slug } = await params;
  const category = await loadCategory(slug);

  const schema = category
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Categories", item: absoluteUrl("/categories") },
          { "@type": "ListItem", position: 3, name: category.name, item: absoluteUrl(`/categories/${category.slug}`) },
        ],
      }
    : null;

  return (
    <>
      {children}
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
    </>
  );
}
