import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-clash',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cabinet',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ConvertMaster | Ultra-Modern File Conversion",
  description: "Transform your files with our sleek, neumorphic UI. No scrolling, just pure efficiency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${outfit.variable}`}>
      <body className="overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-background to-blue-100">
        <div className="h-screen w-screen flex items-center justify-center p-2">
          {children}
        </div>
      </body>
    </html>
  );
}
