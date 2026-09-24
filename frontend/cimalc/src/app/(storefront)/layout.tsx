import { Phone } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/lib/config/site";

export default function StorefrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <a
                href={`tel:${siteConfig.phone.tel}`}
                aria-label={`Call ${siteConfig.name} on ${siteConfig.phone.display}`}
                className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full border border-border bg-surface text-accent shadow-lg transition-colors hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
                <Phone className="h-5 w-5" aria-hidden="true" />
            </a>
        </div>
    );
}
