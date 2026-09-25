import Link from "next/link";
import { MediaImage } from "@/components/ui/media-image";
import { Badge } from "@/components/ui/badge";
import { PLACEHOLDER_IMAGE } from "@/lib/media/image";
import type { QuoteLine } from "@/types/quote";

const money = (value: number) => `₦${value.toLocaleString("en-NG")}`;

/** Products on a quote. Links to the storefront page, which is gone if the product was unpublished. */
export function QuoteLines({ lines }: { lines: QuoteLine[] }) {
  return (
    <ul className="divide-y divide-border rounded-md border border-border bg-surface">
      {lines.map((line) => (
        <li key={line.id} className="flex items-center gap-4 p-4">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-background">
            <MediaImage
              src={line.product.image ?? PLACEHOLDER_IMAGE}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          </span>
          <div className="min-w-0 flex-1">
            <Link
              href={`/products/${line.product.slug}`}
              className="block truncate font-medium text-default hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {line.product.name}
            </Link>
            <p className="text-xs text-muted">Quantity {line.quantity}</p>
          </div>
          {line.availability != null && (
            <Badge variant={line.availability ? "success" : "neutral"}>
              {line.availability ? "Available" : "Out of stock"}
            </Badge>
          )}
          {line.unitPrice != null && (
            <p className="shrink-0 text-right text-sm font-semibold text-default">
              {money(line.unitPrice)}
              <span className="block text-xs font-normal text-muted">
                each · {money(line.unitPrice * line.quantity)}
              </span>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
