import EmailVerifiedWatcher from "@/components/common/EmailVerifiedWatcher";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import TopLoadingBar from "@/components/common/TopLoadingBar";
import { DialogProvider } from "@/contexts/DialogContext";
import { DialogRenderer } from "@/contexts/DialogRenderer";
import { RoleProvider } from "@/contexts/RoleContext";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { Ibarra_Real_Nova, Montserrat } from "next/font/google";
import { headers } from "next/headers";
import { Suspense } from "react";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

const iRN = Ibarra_Real_Nova({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-ibarra",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
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
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  const verifiedSession = session?.user.emailVerified ? session : null;
  const profile = verifiedSession
    ? await prisma.profile.findUnique({
        where: { userId: verifiedSession.user.id },
        select: { role: true },
      })
    : null;

  return (
    <html lang="en" className={`${montserrat.variable} ${iRN.variable}`}>
      <body>
        <RoleProvider role={profile?.role ?? null}>
          <DialogProvider>
            <TopLoadingBar />
            <Suspense fallback={null}>
              <EmailVerifiedWatcher />
            </Suspense>
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
