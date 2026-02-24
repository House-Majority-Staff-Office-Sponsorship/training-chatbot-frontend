import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "House Training Chatbot",
  description: "AI-powered training assistant for House staff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
