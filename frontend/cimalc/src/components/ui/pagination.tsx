"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

type PageItem = { kind: "page"; page: number } | { kind: "gap"; key: string };

/** First and last page, the current page and its neighbours. Larger gaps become an ellipsis. */
function visiblePages(current: number, total: number): PageItem[] {
    const wanted = new Set([1, total, current - 1, current, current + 1]);
    const pages = [...wanted].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
    const items: PageItem[] = [];
    pages.forEach((page, index) => {
        const previous = pages[index - 1];
        if (previous !== undefined && page - previous === 2) items.push({ kind: "page", page: previous + 1 });
        else if (previous !== undefined && page - previous > 2) items.push({ kind: "gap", key: `gap-after-${previous}` });
        items.push({ kind: "page", page });
    });
    return items;
}

const buttonClass = "grid h-11 w-11 place-items-center rounded-sm text-default transition-colors duration-150 ease-out hover:bg-background disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
            <button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className={buttonClass}>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {visiblePages(currentPage, totalPages).map((item) =>
                item.kind === "gap" ? (
                    <span key={item.key} aria-hidden="true" className="grid h-11 w-6 place-items-center text-muted">…</span>
                ) : (
                    <button
                        key={item.page}
                        type="button"
                        aria-label={`Page ${item.page}`}
                        aria-current={item.page === currentPage ? "page" : undefined}
                        onClick={() => onPageChange(item.page)}
                        className={cn(
                            "grid h-11 w-11 place-items-center rounded-sm text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                            item.page === currentPage ? "bg-brand text-white" : "text-default hover:bg-background",
                        )}
                    >
                        {item.page}
                    </button>
                ),
            )}
            <button type="button" aria-label="Next page" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className={buttonClass}>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
        </nav>
    );
}
