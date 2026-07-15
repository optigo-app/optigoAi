"use client";

import { Suspense } from "react";
import CheckoutClient from "@/components/Checkout/CheckoutClient";
import FullPageLoader from "@/components/FullPageLoader";

export default function CheckoutPage() {
    return (
        <Suspense fallback={<FullPageLoader open={true} />}>
            <CheckoutClient />
        </Suspense>
    );
}
