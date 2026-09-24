import type { Metadata } from "next";
import { loadProduct } from "@/lib/api/server";
import { absoluteUrl, siteConfig } from "@/lib/config/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };

  const image = absoluteUrl(product.images[0]?.url ?? siteConfig.logo);
  const description = product.description || `${product.name} from ${siteConfig.name}. Request a tailored quote.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: absoluteUrl(`/products/${product.slug}`) },
    openGraph: { title: product.name, description, type: "website", images: [{ url: image, alt: product.name }] },
    twitter: { card: "summary_large_image", title: product.name, description, images: [image] },
  };
}

export default async function ProductSlugLayout({ children, params }: { children: React.ReactNode } & Params) {
  const { slug } = await params;
  const product = await loadProduct(slug);

  const schema = product
    ? [
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description || undefined,
          image: product.images.map((image) => absoluteUrl(image.url)),
          sku: product.id,
          category: product.categoryName,
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Products", item: absoluteUrl("/products") },
            { "@type": "ListItem", position: 3, name: product.name, item: absoluteUrl(`/products/${product.slug}`) },
          ],
        },
      ]
    : null;

  return (
    <>
      {children}
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
    </>
  );
}
