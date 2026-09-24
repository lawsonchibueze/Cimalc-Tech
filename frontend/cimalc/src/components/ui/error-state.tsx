import { AlertTriangle } from "lucide-react";
import { Button } from "./button";


interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = "Something went wrong",
    description = "We couldn't load this content. Please try again.",
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-md border border-error-bg bg-error-bg/40 py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-error" aria-hidden="true" />
            <p className="text-base font-semibold text-default">{title}</p>
            <p className="max-w-sm text-sm text-muted">{description}</p>
            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
                    Try again
                </Button>
            )}
        </div>
    );
}