import { Phone } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BRAND_COLORS, WhatsAppIcon } from "@/components/ui/brand-icons";
import { siteConfig } from "@/lib/config/site";

const floatingClass = "grid h-12 w-12 place-items-center rounded-full shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

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
            <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
                <a
                    href={siteConfig.whatsapp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Chat with ${siteConfig.name} on WhatsApp`}
                    title="Chat on WhatsApp"
                    className={`${floatingClass} text-white focus-visible:ring-[#25D366]`}
                    style={{ backgroundColor: BRAND_COLORS.whatsapp }}
                >
                    <WhatsAppIcon className="h-6 w-6" />
                </a>
                <a
                    href={`tel:${siteConfig.phone.tel}`}
                    aria-label={`Call ${siteConfig.name} on ${siteConfig.phone.display}`}
                    title="Call us"
                    className={`${floatingClass} border border-border bg-surface text-accent hover:bg-accent hover:text-white focus-visible:ring-accent`}
                >
                    <Phone className="h-5 w-5" aria-hidden="true" />
                </a>
            </div>
        </div>
    );
}
