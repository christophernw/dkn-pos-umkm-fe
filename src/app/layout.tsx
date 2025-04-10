import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import Provider from "./Provider";
import { options } from "./lib/authoptions";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModalProvider } from "@/contexts/ModalContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LANCAR - Sistem POS untuk UMKM",
  description: "Aplikasi point of sale (POS) untuk membantu UMKM mengelola produk, transaksi, dan laporan keuangan dengan mudah",
  keywords: ["POS", "UMKM", "point of sale", "manajemen bisnis", "Indonesia"],
  authors: [{ name: "PPL B - Kelompok 6" }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(options);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen overflow-x-hidden custom-scrollbar-hidden antialiased flex justify-center`}
      >
        <Provider session={session}>
          <AuthProvider>
            <ModalProvider>
              <div className="w-full sm:w-[420px] min-h-screen bg-[#EDF1F9]">
                <div className="h-full">{children}</div>
              </div>
            </ModalProvider>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
