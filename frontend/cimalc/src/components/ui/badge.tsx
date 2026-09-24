import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
    {
        variants: {
            variant: {
                success: "bg-success-bg text-success",
                error: "bg-error-bg text-error",
                warning: "bg-warning-bg text-warning",
                info: "bg-brand/10 text-brand",
                neutral: "bg-border/60 text-muted",
            },
        },
        defaultVariants: { variant: "neutral" },
    },
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
    children: React.ReactNode;
    className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
    return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}
