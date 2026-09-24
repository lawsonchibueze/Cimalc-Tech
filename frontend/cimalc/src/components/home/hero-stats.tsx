"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/categories";
import { categoryKeys } from "@/lib/queries/categories";
import { siteConfig } from "@/lib/config/site";

/**
 * Strip under the hero. Every cell states something true about the shop and none
 * invents a number, so it stays correct as the catalogue grows.
 */
export function HeroStats() {
  const { data: categories } = useQuery({ queryKey: categoryKeys.lists(), queryFn: getCategories });
  const count = categories?.length ?? 0;

  const cells = [
    { title: "Free quotes", note: "No payment to ask", href: "/products" },
    { title: count > 1 ? `${count} categories` : "Full range", note: "Phones, laptops and more", href: "/categories" },
    { title: `${siteConfig.address.locality}, Lagos`, note: "Visit us in store", href: "/contact" },
    { title: "WhatsApp", note: "Chat with our team", href: siteConfig.whatsapp.url, external: true },
  ];

  return (
    <div className="relative z-10 border-t border-white/15 bg-black/35 backdrop-blur-md">
      <ul className="mx-auto grid max-w-[1440px] grid-cols-2 lg:grid-cols-4">
        {cells.map((cell, index) => (
          <li key={cell.title} className={`border-white/15 ${index % 2 === 1 ? "border-l" : ""} ${index > 1 ? "border-t lg:border-t-0" : ""} lg:border-l ${index === 0 ? "lg:border-l-0" : ""}`}>
            <Link href={cell.href} {...(cell.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block px-4 py-5 text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white md:px-8 md:py-6">
              <span className="block text-xl font-bold tracking-tight md:text-2xl">{cell.title}</span>
              <span className="mt-1 block text-sm text-white/70">{cell.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
