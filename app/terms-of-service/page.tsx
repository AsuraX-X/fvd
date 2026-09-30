import LegalDocument from "@/components/legal/LegalDocument";

export const metadata = {
  title: "Terms of Service — FVD",
  description: "The terms that govern your use of the FVDlance platform.",
  alternates: { canonical: "/terms-of-service" },
  // Draft pending legal review — keep out of search results until finalised.
  robots: { index: false, follow: true },
};

const page = () => (
  <LegalDocument
    file="TERMS_OF_SERVICE.txt"
    eyebrow="Legal"
    heading="Terms of Service"
  />
);

export default page;
