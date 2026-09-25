"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { getCategories } from "@/lib/api/categories";
import { categoryKeys } from "@/lib/queries/categories";
import { siteConfig } from "@/lib/config/site";

/**
 * Strip under the hero. Every cell states something true about the shop and none
 * invents a number, so it stays correct as the catalogue grows. Cells flip up one
 * after another when scrolled into view, and lift with a growing bar on hover.
 */
export function HeroStats() {
  const reduced = useReducedMotion();
  const { data: categories } = useQuery({ queryKey: categoryKeys.lists(), queryFn: getCategories });
  const count = categories?.length ?? 0;

  const cells = [
    { title: "Free quotes", note: "No payment to ask", href: "/products" },
    { title: count > 1 ? `${count} categories` : "Full range", note: "Phones, laptops and more", href: "/categories" },
    { title: `${siteConfig.address.locality}, Lagos`, note: "Visit us in store", href: "/contact" },
    { title: "WhatsApp", note: "Chat with our team", href: siteConfig.whatsapp.url, external: true },
  ];

  return (
    <div className="border-t border-white/20 bg-black/20 [perspective:800px]">
      <ul className="mx-auto grid max-w-[1440px] grid-cols-2 lg:grid-cols-4">
        {cells.map((cell, index) => (
          <motion.li
            key={cell.title}
            className={`border-white/20 ${index % 2 === 1 ? "border-l" : ""} ${index > 1 ? "border-t lg:border-t-0" : ""} lg:border-l ${index === 0 ? "lg:border-l-0" : ""}`}
            initial={reduced ? false : { opacity: 0, y: 40, rotateX: -60 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ type: "spring", stiffness: 140, damping: 16, delay: index * 0.12 }}
          >
            <motion.div whileHover={reduced ? undefined : { y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="h-full">
              <Link
                href={cell.href}
                {...(cell.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group relative block h-full px-4 py-5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white md:px-8 md:py-6"
              >
                <span className="absolute left-4 top-0 h-1 w-8 bg-white transition-all duration-300 group-hover:w-24 md:left-8" aria-hidden="true" />
                <span className="block text-xl font-bold tracking-tight md:text-2xl">{cell.title}</span>
                <span className="mt-1 block text-sm text-white/80">{cell.note}</span>
              </Link>
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
