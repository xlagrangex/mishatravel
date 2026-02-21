import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

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
        {process.env.NODE_ENV === "development" && (
          <script src="https://unpkg.com/react-scan/dist/auto.global.js" crossOrigin="anonymous" />
        )}
        {children}
      </body>
    </html>
  );
}
