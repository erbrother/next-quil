import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";
import Providers from "@/components/Provider";

import "react-loading-skeleton/dist/skeleton.css"
import 'simplebar-react/dist/simplebar.min.css'
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = {
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
};

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <Providers>
          <body
            className={cn(
              "min-h-screen font-sans antialiased grainy box-border",
              geistSans.variable,
              geistMono.variable
            )}
          >
            <Toaster></Toaster>
            <Navbar></Navbar>
            <Suspense>
              {children}
            </Suspense>
          </body>
        </Providers>
      </html>
    </AuthProvider>
  );
}
