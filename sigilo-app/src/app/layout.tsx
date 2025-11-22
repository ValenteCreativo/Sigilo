import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SIGILO - Anonymous Whistleblowing",
  description:
    "Anonymous, verifiable whistleblowing for places where speaking can cost your life.",
  keywords: [
    "whistleblowing",
    "anonymous",
    "encrypted",
    "secure",
    "journalism",
    "protection",
  ],
  authors: [{ name: "Sigilo" }],
  openGraph: {
    title: "SIGILO",
    description:
      "Anonymous, verifiable whistleblowing for places where speaking can cost your life.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-sigilo-bg text-sigilo-text-primary min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
