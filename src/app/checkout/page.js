import { Suspense } from "react";
import CheckoutClient from "@/components/Checkout/CheckoutClient";
import FullPageLoader from "@/components/FullPageLoader";

export const metadata = {
    title: "Optigo Ai Studio | Checkout",
    description: "Securely checkout your selected jewelry items.",
};

export default function CheckoutPage() {
    return (
        <Suspense fallback={<FullPageLoader open={true} />}>
            <CheckoutClient />
        </Suspense>
    );
}
