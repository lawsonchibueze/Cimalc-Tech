"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLogo } from "./site-logo";
import type { SessionUser } from "@/types/user";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  user: SessionUser | null;
  onSignOut: () => void;
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  links,
  user,
  onSignOut,
}: MobileNavDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && drawerRef.current) {
        const focusable =
          drawerRef.current.querySelectorAll<HTMLElement>("a, button, input");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const term = search.trim();
    if (!term) return;
    onClose();
    router.push("/products?search=" + encodeURIComponent(term));
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation overlay"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={drawerRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,380px)] flex-col overflow-y-auto border-r border-border bg-background p-5 text-default shadow-2xl lg:hidden sm:p-6"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={onClose}
                aria-label="Cimalc Tech home"
                className="w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <SiteLogo className="h-12 w-12" sizes="96px" />
              </Link>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close navigation"
                onClick={onClose}
                className="grid h-11 w-11 place-items-center rounded-full text-default transition-colors hover:bg-surface hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <form
              className="relative mt-8"
              role="search"
              onSubmit={submitSearch}
            >
              <Search
                className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-brand/60"
                aria-hidden="true"
              />
              <input
                aria-label="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
                className="h-11 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm text-default outline-none placeholder:text-muted focus:border-brand/40 focus:ring-4 focus:ring-accent/10"
              />
            </form>
            <nav
              className="mt-8 flex flex-col gap-1"
              aria-label="Mobile navigation"
            >
              {links.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="flex min-h-14 items-center justify-between rounded-md px-3 text-lg font-semibold text-default transition-colors hover:bg-surface hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <span>{link.label}</span>
                  <span className="font-mono text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              ))}
            </nav>
            <div className="mt-8 space-y-3 border-t border-border pt-6">
              <Button href="/contact" className="w-full" onClick={onClose}>
                Contact us{" "}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              {user ? (
                <>
                  <Button
                    href="/account"
                    variant="secondary"
                    className="w-full"
                    onClick={onClose}
                  >
                    My account
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      onClose();
                      onSignOut();
                    }}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    href="/auth/sign-up"
                    variant="secondary"
                    className="w-full"
                    onClick={onClose}
                  >
                    Get started
                  </Button>
                  <Button
                    href="/auth/sign-in"
                    variant="ghost"
                    className="w-full"
                    onClick={onClose}
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
            <p className="mt-auto pt-10 text-xs leading-5 text-muted">
              Need help choosing? Our team can help you find the right fit.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
