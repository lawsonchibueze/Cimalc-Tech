import { PackageSearch } from "lucide-react";
import { Button } from "./button";


interface EmptyStateProps {
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-16 text-center">
            <PackageSearch className="h-10 w-10 text-muted" aria-hidden="true" />
            <p className="text-base font-semibold text-default">{title}</p>
            {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
            {actionLabel && actionHref && (
                <Button href={actionHref} variant="secondary" size="sm" className="mt-2">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}