import Script from "next/script";
import ServicesContent from "@/components/services/ServicesContent";

export const metadata = {
  title: "Services — FVD",
  description: "Full-cycle brand building: strategy, creative, production, lifecycle.",
  alternates: { canonical: "/services" },
  openGraph: { title: "Services — FVD", description: "Full-cycle brand building", url: "/services", images: ["/home/hero.png"] },
  twitter: { card: "summary_large_image", title: "Services — FVD", description: "Full-cycle brand building", images: ["/home/hero.png"] },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "/" },
    { "@type": "ListItem", position: 2, name: "Services", item: "/services" },
  ],
};

const page = () => {
  return (
    <main className="pt-50 ">
      <ServicesContent />
      <Script id="services-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </main>
  );
};

export default page;
