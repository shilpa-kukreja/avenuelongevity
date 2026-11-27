
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./globals.css";
import Script from "next/script";
import AiChatbot from "@/components/AiChatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Avenue Longevity Retreat",
  description:
    "Discover wellness rituals, recovery technology and premium longevity experiences at Avenue Longevity Retreat.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            {children}

            {/* Chatbot with Suspense boundary */}
            <Suspense fallback={null}>
              <AiChatbot />
            </Suspense>
          </CartProvider>
        </AuthProvider>

        {/* Razorpay Checkout */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
