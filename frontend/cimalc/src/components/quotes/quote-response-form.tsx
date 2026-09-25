"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuoteResponseInput } from "@/lib/api/quotes";
import type { QuoteLine } from "@/types/quote";

const money = (value: number) => `₦${value.toLocaleString("en-NG")}`;

interface QuoteResponseFormProps {
  lines: QuoteLine[];
  submitting: boolean;
  /** Changes the button wording when staff revise a quote they already sent. */
  submitLabel?: string;
  onSubmit: (data: QuoteResponseInput) => Promise<unknown>;
}

/**
 * Staff answer a request by giving every product a price and availability.
 * Submitting emails the customer and updates what they see on their dashboard.
 */
export function QuoteResponseForm({
  lines,
  submitting,
  submitLabel = "Send quote to customer",
  onSubmit,
}: QuoteResponseFormProps) {
  const [prices, setPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      lines.map((line) => [
        line.id,
        line.unitPrice != null ? String(line.unitPrice) : "",
      ]),
    ),
  );
  const [availability, setAvailability] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        lines.map((line) => [line.id, line.availability ?? true]),
      ),
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const total = lines.reduce((sum, line) => {
    const raw = (prices[line.id] ?? "").trim();
    const value = Number(raw);
    return raw && Number.isFinite(value) && value >= 0
      ? sum + value * line.quantity
      : sum;
  }, 0);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const prepared: QuoteResponseInput["lines"] = [];
    for (const line of lines) {
      const raw = (prices[line.id] ?? "").trim();
      const value = Number(raw);
      if (!raw || !Number.isInteger(value) || value < 0) {
        setError(`Enter a whole naira price for ${line.product.name}.`);
        return;
      }
      prepared.push({
        id: line.id,
        unitPrice: value,
        availability: availability[line.id] ?? true,
      });
    }

    try {
      await onSubmit({ lines: prepared, message: message.trim() || undefined });
      setMessage("");
    } catch {
      // The page shows the error and the draft stays so nothing is lost.
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <ul className="space-y-3">
        {lines.map((line) => (
          <li
            key={line.id}
            className="rounded-md border border-border bg-background p-4"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-default">
                  {line.product.name}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Quantity {line.quantity}
                </p>
              </div>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
                Unit price (₦)
                <input
                  inputMode="numeric"
                  value={prices[line.id] ?? ""}
                  onChange={(event) =>
                    setPrices((current) => ({
                      ...current,
                      [line.id]: event.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="0"
                  className="h-11 w-32 rounded-sm border border-border bg-surface px-3 text-sm text-default placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
                Availability
                <select
                  value={(availability[line.id] ?? true) ? "available" : "out"}
                  onChange={(event) =>
                    setAvailability((current) => ({
                      ...current,
                      [line.id]: event.target.value === "available",
                    }))
                  }
                  className="h-11 rounded-sm border border-border bg-surface px-3 text-sm text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <option value="available">Available</option>
                  <option value="out">Out of stock</option>
                </select>
              </label>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="quote-response-message"
          className="text-sm font-medium text-default"
        >
          Message to the customer (optional)
        </label>
        <textarea
          id="quote-response-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Add delivery, warranty or lead-time details"
          className="w-full rounded-sm border border-border bg-surface px-4 py-3 text-sm text-default placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-sm bg-error-bg px-3 py-2 text-sm text-error"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Estimated total:{" "}
          <span className="font-semibold text-default">{money(total)}</span>
        </p>
        <Button type="submit" isLoading={submitting}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
