import type { Product } from "@/types/product";

export const mockProducts: Product[] = [
    {
        id: "1",
        slug: "aurawave-pro-headphones",
        name: "AuraWave Pro Headphones",
        description: "Active noise-cancelling over-ear headphones with 40-hour battery life.",
        categorySlug: "headphones",
        images: [{ id: "1a", url: "/products/mock.png", alt: "AuraWave Pro Headphones" }],
        inStock: true,
        specifications: [{ label: "Battery", value: "Up to 40 hours" }, { label: "Connection", value: "Bluetooth 5.3" }, { label: "Warranty", value: "12 months" }],
    },
    {
        id: "2",
        slug: "nimbus-14-laptop",
        name: "Nimbus 14 Laptop",
        description: "14-inch ultralight laptop built for all-day productivity.",
        categorySlug: "laptops",
        images: [{ id: "2a", url: "/products/mock.png", alt: "Nimbus 14 Laptop" }],
        inStock: true,
        specifications: [{ label: "Display", value: "14-inch productivity display" }, { label: "Form factor", value: "Ultralight" }, { label: "Warranty", value: "12 months" }],
    },
    {
        id: "3",
        slug: "glowbulb-smart-bulb",
        name: "GlowBulb Smart Bulb",
        description: "Wi-Fi enabled smart bulb with 16 million colors and voice control.",
        categorySlug: "smart-home",
        images: [{ id: "3a", url: "/products/mock.png", alt: "GlowBulb Smart Bulb" }],
        inStock: false,
        specifications: [{ label: "Connectivity", value: "Wi-Fi enabled" }, { label: "Colors", value: "16 million" }, { label: "Control", value: "Voice and app" }],
    },
    {
        id: "4",
        slug: "cordly-fast-charger",
        name: "Cordly 65W Fast Charger",
        description: "Compact GaN charger, fast-charges laptops and phones alike.",
        categorySlug: "accessories",
        images: [{ id: "4a", url: "/products/mock.png", alt: "Cordly 65W Fast Charger" }],
        inStock: true,
        specifications: [{ label: "Power", value: "65W GaN" }, { label: "Form factor", value: "Compact" }, { label: "Compatibility", value: "Laptop and phone" }],
    },
];
