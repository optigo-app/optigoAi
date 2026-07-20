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
  const [loaderProps, setLoaderProps] = useState({ subtitle: "Loading products..." });
  const handleInitialLoadComplete = useCallback(() => setIsInitialLoadComplete(true), []);
  const handleLoaderPropsChange = useCallback((props) => setLoaderProps(props), []);

  return (
    <>
      <FullPageLoader open={!isInitialLoadComplete} showLogo={true} {...loaderProps} />
      <ProductClient onInitialLoadComplete={handleInitialLoadComplete} onLoaderPropsChange={handleLoaderPropsChange} />
    </>
  );
}
