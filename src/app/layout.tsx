import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Misha Travel - Tour Operator",
  description:
    "Misha Travel: tour operator italiano specializzato in viaggi culturali, grandi itinerari e crociere fluviali. Scopri le nostre destinazioni in Europa, Asia, America Latina e Africa.",
  keywords: [
    "tour operator",
    "viaggi culturali",
    "crociere fluviali",
    "Misha Travel",
    "itinerari",
    "viaggi organizzati",
  ],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${poppins.variable} ${inter.variable} antialiased`}
      >
        <TopBar />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
