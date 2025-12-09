import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bluconn Task Manager",
  description: "Simple task manager built with Next.js & FastAPI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
