import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductGridSkeleton } from "@/components/product/product-grid";
import ProductsBrowser from "./products-browser";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse phones, laptops, gadgets and accessories, then request a tailored quote.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8"><ProductGridSkeleton count={9} /></div>}>
      <ProductsBrowser />
    </Suspense>
  );
}
