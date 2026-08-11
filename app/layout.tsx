import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import TopLoadingBar from "@/components/common/TopLoadingBar";
import { DialogProvider } from "@/contexts/DialogContext";
import { DialogRenderer } from "@/contexts/DialogRenderer";
import { RoleProvider } from "@/contexts/RoleContext";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { headers } from "next/headers";
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
  description:
    "FVD — creative studio activating brand value through sensory experiences.",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  const profile = session
    ? await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { role: true },
      })
    : null;

  return (
    <html lang="en" className={`${montserrat.variable} ${cormorant.variable}`}>
      <body>
        <RoleProvider role={profile?.role ?? null}>
          <DialogProvider>
            <TopLoadingBar />
            <Header />
            {children}
            <Footer />
            <DialogRenderer />
          </DialogProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
