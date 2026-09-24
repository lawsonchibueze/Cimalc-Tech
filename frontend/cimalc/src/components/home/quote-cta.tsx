import { Button } from "../ui/button";

export function QuoteCta() {
    return (
        <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8">
            <div className="flex flex-col items-center gap-4 rounded-md border border-border bg-surface p-10 text-center md:p-16">
                <h2 className="text-2xl font-bold text-default">Buying in bulk?</h2>
                <p className="max-w-md text-sm text-muted">
                    Tell us what you need and how many. Our team will get back to you with pricing for larger orders.
                </p>
                <Button href="/contact" variant="primary" size="lg">Ask about bulk pricing</Button>
            </div>
        </section>
    );
}
