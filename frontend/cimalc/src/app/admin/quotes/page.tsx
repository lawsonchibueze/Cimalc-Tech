import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminQuotesList } from "./quotes-list";

export default function AdminQuotesPage() {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><AdminQuotesList /></Suspense>;
}
