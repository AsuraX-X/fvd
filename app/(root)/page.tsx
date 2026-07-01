import Script from "next/script";
import Experts from "@/components/home/Experts";
import Hero from "@/components/home/Hero";
import WhoAreWe from "@/components/home/WhoAreWe";

export const metadata = {
  title: "FVD — Creative studio for sensory brand experiences",
  description: "A creative studio activating brand value through sensory experiences.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "FVD — Creative studio",
    description: "A creative studio activating brand value through sensory experiences.",
    url: "/",
    images: ["/home/hero.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FVD — Creative studio",
    description: "A creative studio activating brand value through sensory experiences.",
    images: ["/home/hero.png"],
  },
};

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FVD",
  url: "/",
  logo: "/logo/favicon.png",
};

const page = () => {
  return (
    <main>
      <Hero />
      <WhoAreWe />
      <Experts />
      <Script id="org-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
    </main>
  );
};

export default page;
