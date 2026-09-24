"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuoteMessage } from "@/types/quote";

interface QuoteThreadProps {
    /** Who is looking at the thread, so their own messages sit on the right. */
    viewer: "CUSTOMER" | "STAFF";
    customerName: string;
    /** The request text the customer wrote when they submitted the quote. */
    originalMessage: string | null;
    messages: QuoteMessage[];
    submittedAt: string;
    /** Turns the reply box off, for example once a quote is closed. */
    closedReason?: string;
    onSend: (body: string) => Promise<unknown>;
}

const time = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function QuoteThread({ viewer, customerName, originalMessage, messages, submittedAt, closedReason, onSend }: QuoteThreadProps) {
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);

    const entries = [
        ...(originalMessage ? [{ id: "original", body: originalMessage, createdAt: submittedAt, sender: "CUSTOMER" as const, label: "Original request" }] : []),
        ...messages.map((message) => ({ ...message, label: undefined as string | undefined })),
    ];

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        const text = body.trim();
        if (!text || sending) return;
        setSending(true);
        try {
            await onSend(text);
            setBody("");
        } catch {
            // The caller reports the error. The draft stays so nothing is lost.
        } finally {
            setSending(false);
        }
    }

    return (
        <section aria-labelledby="thread-heading" className="space-y-4">
            <h2 id="thread-heading" className="text-lg font-semibold">Messages</h2>
            {entries.length === 0 ? (
                <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">No messages yet.</p>
            ) : (
                <ol className="space-y-3">
                    {entries.map((entry) => {
                        const own = entry.sender === viewer;
                        const author = entry.sender === "STAFF" ? "Cimalc Tech" : viewer === "CUSTOMER" ? "You" : customerName;
                        return (
                            <li key={entry.id} className={cn("flex", own ? "justify-end" : "justify-start")}>
                                <div className={cn("max-w-[85%] rounded-md border px-4 py-3 text-sm", own ? "border-brand/20 bg-brand/5" : "border-border bg-surface")}>
                                    <p className="text-xs font-medium text-muted">
                                        {entry.label ? `${entry.label} · ` : ""}{author} · {time(entry.createdAt)}
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap break-words leading-6 text-default">{entry.body}</p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}

            {closedReason ? (
                <p className="rounded-md bg-background px-4 py-3 text-sm text-muted">{closedReason}</p>
            ) : (
                <form onSubmit={submit} className="space-y-3">
                    <label htmlFor="quote-reply" className="text-sm font-medium">Send a message</label>
                    <textarea
                        id="quote-reply"
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        rows={3}
                        maxLength={2000}
                        placeholder={viewer === "CUSTOMER" ? "Ask a question or add details for our team" : "Reply to the customer"}
                        className="w-full rounded-sm border border-border bg-surface px-4 py-3 text-sm text-default placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    />
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-muted">{body.length}/2000</span>
                        <Button type="submit" size="sm" isLoading={sending} disabled={!body.trim()}>
                            <Send className="h-4 w-4" aria-hidden="true" />Send message
                        </Button>
                    </div>
                </form>
            )}
        </section>
    );
}
