import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "./providers";
import { FormFlowProvider } from "../context/FormFlowContext";
import Navbar from "../components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Assure - Enterprise KYC & Compliance Platform",
  description: "AI-powered identity verification with zero-secret security on Azure. Built for regulatory compliance with human-in-the-loop decisioning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <FormFlowProvider>
            <Navbar />
            {children}
          </FormFlowProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
