"use client";

import { Mail, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { contactFormSchema, type ContactFormInput } from "@/lib/validations/contact";
import { submitContactForm } from "@/lib/api/contact";
import { errorMessage } from "@/lib/api/client";
import { siteConfig } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const iconBox = "grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand/10 text-brand";
const detailLink = "flex items-center gap-3 text-default hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export default function ContactPage() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormInput>({ resolver: zodResolver(contactFormSchema) });
    const mutation = useMutation({
        mutationFn: submitContactForm,
        onSuccess: () => { toast.success("Message sent. We’ll get back to you soon."); reset(); },
        onError: (error) => toast.error(errorMessage(error, "We could not send your message. Please try again.")),
    });
    const { phone, address, email } = siteConfig;

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-12">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
            <div className="mt-12 grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Let’s talk</p>
                    <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">A better answer starts with a conversation.</h1>
                    <p className="mt-5 max-w-lg text-base leading-7 text-muted">Need help choosing, sourcing for a team, or requesting a custom quote? Tell us what you’re looking for.</p>
                    <div className="mt-10 space-y-5">
                        <div className="flex gap-3"><span className={iconBox}><MessageCircle className="h-5 w-5" aria-hidden="true" /></span><div><p className="font-semibold">Product guidance</p><p className="mt-1 text-sm text-muted">Share your use case and we’ll point you in the right direction.</p></div></div>
                        <div className="flex gap-3"><span className={iconBox}><Mail className="h-5 w-5" aria-hidden="true" /></span><div><p className="font-semibold">Quote support</p><p className="mt-1 text-sm text-muted">We can help with quantities, alternatives, and availability.</p></div></div>
                    </div>
                    <div className="mt-10 space-y-4 border-t border-border pt-8 text-sm">
                        <a href={`tel:${phone.tel}`} className={detailLink}><Phone className="h-4 w-4 text-brand" aria-hidden="true" />{phone.display}</a>
                        {email && <a href={`mailto:${email}`} className={detailLink}><Mail className="h-4 w-4 text-brand" aria-hidden="true" />{email}</a>}
                        <p className="flex items-start gap-3 text-default"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" /><span>{address.street}, {address.locality}, {address.region}</span></p>
                    </div>
                </div>
                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="rounded-lg border border-border bg-surface p-5 shadow-sm md:p-8">
                    <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-brand"><Sparkles className="h-4 w-4" aria-hidden="true" />Tell us what you need</div>
                    <div className="space-y-4">
                        <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
                        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium text-default">Message</label>
                            <textarea id="message" rows={6} maxLength={2000} placeholder="Tell us about the product, quantity, or use case..." className="w-full rounded-sm border border-border bg-surface px-4 py-3 text-sm text-default placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" {...register("message")} />
                            {errors.message && <span className="text-xs text-error">{errors.message.message}</span>}
                        </div>
                        <Button type="submit" isLoading={mutation.isPending} className="w-full">Send message</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
