import { Suspense } from "react";
import ProductClient from "@/components/Product/ProductClient";
import FullPageLoader from "@/components/FullPageLoader";

export const metadata = {
  title: "Optigo Ai Studio | Search Designs",
  description: "Browse and search through our extensive collection of AI-generated jewelry designs.",
};

export default function ProductPage() {
  return (
    <Suspense fallback={<FullPageLoader open={true} />}>
      <ProductClient />
    </Suspense>
  );
}
