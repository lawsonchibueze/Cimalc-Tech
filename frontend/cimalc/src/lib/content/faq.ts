import { siteConfig } from "@/lib/config/site";

/**
 * Only states what the site actually does. Delivery and return terms are not
 * promised here because they are agreed per order, so add them once the
 * business has a written policy.
 */
export const faqs = [
    {
        question: "How does buying from Cimalc Tech work?",
        answer: "Browse the range and choose Request a Quote on any product. Our team confirms availability and pricing and replies to you. Asking is free and no payment is needed.",
    },
    {
        question: "How do I request a bulk quote?",
        answer: "Open the product, choose Request a Quote and set the quantity you need. For larger or mixed orders, send the details through the contact page and we will follow up.",
    },
    {
        question: "Do I need an account?",
        answer: "No. You can request a quote as a guest. An account lets you follow your requests and message our team online.",
    },
    {
        question: "What about delivery and returns?",
        answer: "Delivery and return terms depend on the item and the order, so we confirm them with your quote. Ask us before you request if you need to know first.",
    },
    {
        question: "Where can I find you?",
        answer: `${siteConfig.address.street}, ${siteConfig.address.locality}, ${siteConfig.address.region}. You can also call ${siteConfig.phone.display}.`,
    },
] as const;
