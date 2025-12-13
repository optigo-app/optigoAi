import { Poppins } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeProvider from "@/theme/ThemeProvider";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProductDataProvider } from "@/context/ProductDataContext";

const poppins = Poppins({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "sans-serif",
  ],
});

export const metadata = {
  title: "Optigo Ai Studio",
  description: "Find the perfect jewelry using advanced AI-powered search technology",
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
  },
  other: {
    'theme-color': '#7367f0',
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <body suppressHydrationWarning>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <ToastProvider>
              <Suspense>
                <AuthProvider>
                  <CartProvider>
                    <ProductDataProvider>
                      <Suspense>
                      </Suspense>
                      {children}
                    </ProductDataProvider>
                  </CartProvider>
                </AuthProvider>
              </Suspense>
            </ToastProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
