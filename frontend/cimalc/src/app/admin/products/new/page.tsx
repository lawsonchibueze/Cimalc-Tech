import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
    return (
        <div className="space-y-6">
            <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: "New product" }]} />
            <div><h1 className="text-3xl font-bold tracking-tight">Add product</h1><p className="mt-2 text-sm text-muted">Create a clear, customer-ready catalog entry.</p></div>
            <ProductForm />
        </div>
    );
}
