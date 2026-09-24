import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, MouseEventHandler } from "react";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                primary: "bg-brand text-white hover:bg-brand/90",
                secondary: "border border-brand text-brand bg-transparent hover:bg-brand/5",
                ghost: "text-brand hover:bg-brand/5",
                destructive: "bg-error text-white hover:bg-error/90",
                // Reserved exclusively for Flutterwave/payment actions. Never reuse for general CTAs.
                payment: "bg-payment text-[#0B0C0E] hover:bg-payment/90",
            },
            size: {
                sm: "h-9 px-3 text-sm",
                md: "h-11 px-5 text-sm",
                lg: "h-13 px-6 text-base",
            },
        },
        defaultVariants: { variant: "primary", size: "md" },
    },
);

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    href?: string;
}

export function Button({
    className,
    variant,
    size,
    isLoading,
    href,
    children,
    disabled,
    onClick,
    ...props
}: ButtonProps) {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (href) {
        // A link keeps its click handler, for example to close a drawer before navigating.
        return (
            <Link
                href={href}
                className={classes}
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : undefined}
                onClick={onClick as unknown as MouseEventHandler<HTMLAnchorElement>}
            >
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} disabled={disabled || isLoading} onClick={onClick} {...props}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {children}
        </button>
    );
}
