import type { Metadata } from "next";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConvertMaster | Modern File Conversion",
  description: "Convert images, videos, audio, and documents between formats with our modern, beautiful UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 font-sans antialiased">
        <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-7xl">
          {children}
        </main>
      </body>
    </html>
  );
}
