import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { NewArrivals } from "@/components/home/new-arrivals";
import { ValueProps } from "@/components/home/value-props";
import { QuoteCta } from "@/components/home/quote-cta";


export default function HomePage() {
    return (
        <>
            <Hero />
            <NewArrivals />
            <FeaturedProducts />
            <FeaturedCategories />
            <ValueProps />
            <QuoteCta />
        </>
    );
}
