"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import FullPageLoader from "@/components/FullPageLoader";

// Dynamically import ProductClient with SSR disabled to prevent server-side chunk errors
const ProductClient = dynamic(
  () => import("@/components/Product/ProductClient"),
  {
    ssr: false,
    loading: () => <FullPageLoader open={true} />
  }
);

export default function ProductPage() {
  return (
    <Suspense fallback={<FullPageLoader open={true} />}>
      <ProductClient />
    </Suspense>
  );
}
