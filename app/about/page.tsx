import Script from "next/script";
import AboutContent from "@/components/about/AboutContent";

export const metadata = {
  title: "About — FVD",
  description:
    "FVD is a distributed creative collective blending strategy, storytelling, and production to bring brands to life.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — FVD",
    description:
      "A distributed creative collective blending strategy, storytelling, and production to bring brands to life.",
    url: "/about",
    images: ["/home/hero.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — FVD",
    description:
      "A distributed creative collective blending strategy, storytelling, and production to bring brands to life.",
    images: ["/home/hero.png"],
  },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "/" },
    { "@type": "ListItem", position: 2, name: "About", item: "/about" },
  ],
};

const page = () => {
  return (
    <>
      <AboutContent />
      <Script
        id="about-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
};

export default page;
