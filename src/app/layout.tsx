export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import LayoutWrapper from "@/components/LayoutWrapper";
import styles from "./layout.module.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "STRENGTH FUSION GYM - Admin",
  description: "Premium Gym Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutWrapper sidebar={<Sidebar />} topbar={<TopBar />}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
