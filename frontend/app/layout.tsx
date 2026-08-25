import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "./import-review.css";
import "./product-editor.css";
import "./typography-settings.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TFS Living Catalogue Studio",
  description: "Catalogue management and automatic PDF generation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
