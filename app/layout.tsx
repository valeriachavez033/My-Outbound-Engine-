import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Outbound Engine",
  description: "AI-powered outbound email sequences that book meetings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
