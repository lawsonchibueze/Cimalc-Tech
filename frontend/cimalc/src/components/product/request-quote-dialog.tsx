"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "./quantity-stepper";
import { errorMessage } from "@/lib/api/client";
import { submitQuoteRequest } from "@/lib/api/quotes";
import { quoteKeys } from "@/lib/queries/account";
import { useSession } from "@/lib/auth/use-session";
import { type QuoteRequestInput, quoteRequestSchema } from "@/lib/validations/quote";
import type { Quote } from "@/types/quote";

interface RequestQuoteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    inStock: boolean;
}

export function RequestQuoteDialog({ isOpen, onClose, productId, productName, inStock }: RequestQuoteDialogProps) {
    const [quantity, setQuantity] = useState(1);
    const [submitted, setSubmitted] = useState<Quote | null>(null);
    const { user } = useSession();
    const queryClient = useQueryClient();

    // Signed in customers do not have to retype their details.
    const values = useMemo<QuoteRequestInput>(() => ({ name: user?.name ?? "", email: user?.email ?? "", phone: "", message: "" }), [user]);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<QuoteRequestInput>({ resolver: zodResolver(quoteRequestSchema), values });

    const mutation = useMutation({
        mutationFn: (data: QuoteRequestInput) => submitQuoteRequest(productId, { ...data, quantity }),
        onSuccess: (quote) => {
            setSubmitted(quote);
            void queryClient.invalidateQueries({ queryKey: quoteKeys.mine });
            reset();
        },
        onError: (error) => toast.error(errorMessage(error, "We could not send your request. Please try again.")),
    });

    const close = () => {
        setSubmitted(null);
        setQuantity(1);
        onClose();
    };

    return (
        <Dialog isOpen={isOpen} onClose={close} title={submitted ? "Quote request received" : `Request a quote: ${productName}`}>
            {submitted ? (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <CheckCircle2 className="h-12 w-12 text-success" aria-hidden="true" />
                    <div>
                        <p className="font-semibold text-default">We’re reviewing your request.</p>
                        <p className="mt-2 text-sm leading-6 text-muted">Your reference is <span className="font-mono font-semibold text-default">{submitted.reference}</span>. Keep it handy if you contact us about this request.</p>
                        {!user && <p className="mt-2 text-sm leading-6 text-muted">Create an account with the same email to follow replies from our team online.</p>}
                    </div>
                    <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
                        {user ? (
                            <Button href={`/account/quotes/${submitted.id}`} className="flex-1" onClick={close}>Track this request</Button>
                        ) : (
                            <Button href="/auth/sign-up" className="flex-1" onClick={close}>Create an account</Button>
                        )}
                        <Button href="/products" variant="secondary" className="flex-1" onClick={close}>Keep browsing</Button>
                    </div>
                    <Link href="/contact" onClick={close} className="text-sm font-medium text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Contact support</Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
                    {!inStock && <p className="rounded-sm bg-warning-bg px-3 py-2 text-sm text-warning">This item is out of stock right now. Send a request and we’ll confirm when it can be sourced.</p>}
                    <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
                    <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
                    <Input label="Phone (optional)" type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
                    <div className="flex flex-col gap-2"><span className="text-sm font-medium text-default">Quantity</span><QuantityStepper value={quantity} onChange={setQuantity} /></div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="quote-message" className="text-sm font-medium text-default">Message (optional)</label>
                        <textarea id="quote-message" rows={3} maxLength={2000} className="rounded-sm border border-border bg-surface px-4 py-3 text-sm text-default placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" {...register("message")} />
                        {errors.message && <span className="text-xs text-error">{errors.message.message}</span>}
                    </div>
                    <Button type="submit" isLoading={mutation.isPending} className="mt-2">Submit request</Button>
                </form>
            )}
        </Dialog>
    );
}
