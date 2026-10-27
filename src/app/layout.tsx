import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Portal Kelas",
    template: "%s · Portal Kelas",
  },
  description:
    "Portal informasi kelas: direktori mahasiswa, pengumuman, jadwal, tugas, dan bantuan.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${font.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
