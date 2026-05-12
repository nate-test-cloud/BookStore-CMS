import type { Metadata } from "next";
import { Providers } from "@/components/common/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookStore CMS",
  description: "Complete bookstore management system with inventory, POS, and ecommerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
