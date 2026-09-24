export interface Category {
    id: string;
    slug: string;
    name: string;
    description?: string;
    /** Published products for the storefront, all products for admin. */
    productCount: number;
    /** Image of the newest published product in the category, when there is one. */
    image?: string;
}
