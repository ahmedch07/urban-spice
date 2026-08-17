import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slice & Spice Pizza POS System",
  description: "Production Pizza Store Point of Sale, Billing, Sales & Admin Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
