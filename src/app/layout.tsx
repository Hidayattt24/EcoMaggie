import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoMaggie",
  description:
    "EcoMaggie adalah platform berbasis web yang berfokus pada pengelolaan sampah organik dan pemanfaatannya melalui budidaya maggot. Menghubungkan penghasil sampah organik, transporter, dan petani maggot dalam satu sistem digital terintegrasi untuk menciptakan nilai ekonomi berkelanjutan.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
