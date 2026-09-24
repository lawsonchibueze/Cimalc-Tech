import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminProductsList } from "./products-list";

export default function AdminProductsPage() {
    return <Suspense fallback={<Skeleton className="h-96 w-full" />}><AdminProductsList /></Suspense>;
}
