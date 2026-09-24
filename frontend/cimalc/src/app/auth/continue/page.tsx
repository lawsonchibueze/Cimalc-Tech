import { Suspense } from "react";
import type { Metadata } from "next";
import { ContinueAfterSignIn } from "./continue";

export const metadata: Metadata = { title: "Signing you in" };

export default function ContinuePage() {
    return <Suspense><ContinueAfterSignIn /></Suspense>;
}
