import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
// Environment validation is temporarily disabled for build
// In production, ensure all environment variables meet security requirements
// import { validateEnv } from "@/lib/env-validation";
// validateEnv();

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Social Media Manager - Multi-Company Platform",
  description: "Comprehensive social media management platform for handling multiple client companies with AI-powered content generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
