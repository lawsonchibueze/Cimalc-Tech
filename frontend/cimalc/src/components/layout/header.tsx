"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Search, UserRound } from "lucide-react";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import { SiteLogo } from "./site-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";
import { mainNav } from "@/lib/config/site";
import { getProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { productKeys } from "@/lib/queries/products";
import { categoryKeys } from "@/lib/queries/categories";
import { useSession, useSignOut } from "@/lib/auth/use-session";

const simpleLinks = mainNav.filter((link) => link.href !== "/products" && link.href !== "/categories");
const MENU_PRODUCT_COUNT = 5;

const navClass = "group relative rounded-full px-3 py-2 text-sm font-medium text-default/80 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";
const dropdownClass = "invisible absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 translate-y-2 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100";
const menuItemClass = "block truncate rounded-lg px-3 py-2 text-sm text-default hover:bg-background hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";
const iconButtonClass = "grid h-11 w-11 place-items-center rounded-full text-default transition-all hover:bg-brand/5 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin } = useSession();
  const signOut = useSignOut();
  const products = useQuery({ queryKey: productKeys.menu(), queryFn: () => getProducts({ limit: MENU_PRODUCT_COUNT }) });
  const categories = useQuery({ queryKey: categoryKeys.lists(), queryFn: getCategories });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (search.trim()) router.push("/products?search=" + encodeURIComponent(search.trim()));
  }

  const searchForm = (className: string) => (
    <form onSubmit={submit} role="search" className={cn("relative min-w-0", className)}>
      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-brand/60" aria-hidden="true" />
      <input aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" className="h-11 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm text-default outline-none transition-all placeholder:text-muted focus:border-brand/40 focus:ring-4 focus:ring-accent/10" />
    </form>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-[1440px] flex-wrap items-center gap-3 px-4 py-2 md:px-8 md:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link href="/" aria-label="Cimalc Tech home" className="group flex h-12 w-[148px] shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
              <SiteLogo className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]" eager />
            </Link>
            <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
              <div className={navClass}>
                <Link href="/products" className="inline-flex items-center gap-1 focus-visible:outline-none">Products <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /></Link>
                <div className={dropdownClass} role="menu">
                  <Link href="/products" className={cn(menuItemClass, "mb-1 font-semibold text-brand")} role="menuitem">All products</Link>
                  {products.data?.data.map((product) => <Link key={product.id} href={"/products/" + product.slug} className={menuItemClass} role="menuitem">{product.name}</Link>)}
                </div>
              </div>
              <div className={navClass}>
                <Link href="/categories" className="inline-flex items-center gap-1 focus-visible:outline-none">Categories <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /></Link>
                <div className={dropdownClass} role="menu">
                  <Link href="/categories" className={cn(menuItemClass, "mb-1 font-semibold text-brand")} role="menuitem">All categories</Link>
                  {categories.data?.map((category) => <Link key={category.id} href={"/categories/" + category.slug} className={menuItemClass} role="menuitem">{category.name}</Link>)}
                </div>
              </div>
              {simpleLinks.map((link) => <Link key={link.href} href={link.href} className={cn(navClass, pathname.startsWith(link.href) && "text-brand")}>{link.label}</Link>)}
            </nav>
          </div>
          {searchForm("hidden max-w-sm flex-1 lg:block")}
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            {isAdmin && <Link href="/admin" aria-label="Open admin area" className={iconButtonClass}><LayoutDashboard className="h-5 w-5" aria-hidden="true" /></Link>}
            <Link href={user ? "/account" : "/auth/sign-in"} aria-label={user ? "My account" : "Sign in"} className={iconButtonClass}><UserRound className="h-5 w-5" aria-hidden="true" /></Link>
            {user && <button type="button" aria-label="Sign out" onClick={() => signOut.mutate()} disabled={signOut.isPending} className={cn(iconButtonClass, "hidden sm:grid")}><LogOut className="h-5 w-5" aria-hidden="true" /></button>}
            <button type="button" aria-label="Open menu" aria-expanded={isDrawerOpen} aria-controls="mobile-navigation" onClick={() => setIsDrawerOpen(true)} className={cn(iconButtonClass, "lg:hidden")}><Menu className="h-5 w-5" aria-hidden="true" /></button>
          </div>
          <div className="order-3 basis-full lg:hidden">{searchForm("w-full")}</div>
        </div>
      </header>
      <MobileNavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} links={[...mainNav]} user={user} isAdmin={isAdmin} onSignOut={() => signOut.mutate()} />
    </>
  );
}
