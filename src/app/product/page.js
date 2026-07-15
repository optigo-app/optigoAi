"use client";
import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import FullPageLoader from "@/components/FullPageLoader";

// Dynamically import ProductClient with SSR disabled to prevent server-side chunk errors
const ProductClient = dynamic(
  () => import("@/components/Product/ProductClient"),
  {
    ssr: false,
    loading: () => null
  }
);

export default function ProductPage() {
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const handleInitialLoadComplete = useCallback(() => setIsInitialLoadComplete(true), []);

  return (
    <>
      <FullPageLoader open={!isInitialLoadComplete} showLogo={true} subtitle="Loading products..." />
      <ProductClient onInitialLoadComplete={handleInitialLoadComplete} />
    </>
  );
}
