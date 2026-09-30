import LegalDocument from "@/components/legal/LegalDocument";

export const metadata = {
  title: "Privacy Policy — FVD",
  description: "How FVDlance collects, uses and protects your personal data.",
  alternates: { canonical: "/privacy-policy" },
  // Draft pending legal review — keep out of search results until finalised.
  robots: { index: false, follow: true },
};

const page = () => (
  <LegalDocument
    file="PRIVACY_POLICY.txt"
    eyebrow="Legal"
    heading="Privacy Policy"
  />
);

export default page;
