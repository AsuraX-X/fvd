import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import TopLoadingBar from "@/components/common/TopLoadingBar";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata = {
  title: { default: "FVD", template: "%s | FVD" },
  description: "FVD — creative studio activating brand value through sensory experiences.",
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "FVD",
    images: ["/home/hero.png"],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@yourhandle",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${cormorant.variable}`}>
      <body>
        <TopLoadingBar />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
