import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { faqs } from "@/lib/content/faq";

export const metadata: Metadata = {
    title: "FAQ",
    description: "Answers to common questions about requesting quotes from Cimalc Tech.",
};

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
};

export default function FaqPage() {
    return (
        <div className="mx-auto max-w-2xl px-4 py-16 md:px-8">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
            <h1 className="mt-6 text-2xl font-bold text-default">Frequently Asked Questions</h1>
            <div className="mt-8 flex flex-col divide-y divide-border">
                {faqs.map((faq) => (
                    <div key={faq.question} className="py-5">
                        <h2 className="font-semibold text-default">{faq.question}</h2>
                        <p className="mt-2 text-sm leading-6 text-muted">{faq.answer}</p>
                    </div>
                ))}
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        </div>
    );
}
