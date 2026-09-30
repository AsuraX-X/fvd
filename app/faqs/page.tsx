import FaqsEntry from "@/components/faqs/FaqsEntry";
import { faqs } from "@/constants";
import Script from "next/script";

export const metadata = {
  title: "FAQs — FVD",
  description:
    "Answers about signing up, profile visibility, publishing reach, earnings, payment, and profile management on Fvdlance.",
  alternates: { canonical: "/faqs" },
  openGraph: {
    title: "FAQs — FVD",
    description:
      "Answers about signing up, profile visibility, publishing reach, earnings, payment, and profile management on Fvdlance.",
    url: "/faqs",
    images: ["/home/hero.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQs — FVD",
    description:
      "Answers about signing up, profile visibility, publishing reach, earnings, payment, and profile management on Fvdlance.",
    images: ["/home/hero.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

const page = () => {
  return (
    <main className="px-8 py-50">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-6">
            <p className="small-header">FAQs</p>
            <h1 className="max-w-[32ch] text-5xl italic md:text-6xl">
              Clear answers for getting started and growing your profile.
            </h1>
          </div>

          <div className="border border-primary-light bg-primary-light/60 p-6 transition-colors hover:bg-primary-light md:p-8">
            <p className="small-header mb-4">Quick guide</p>
            <p className="text-body text-sm leading-7">
              Keep your profile complete, show your strongest work, and stay
              consistent. A clear, trustworthy profile is the fastest way to
              attract the right clients.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="flex items-center gap-4">
            <p className="small-header mb-0 text-nowrap">Common questions</p>
            <div className="h-px w-full bg-primary-light" />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqs.map(({ question, answer }) => (
              <FaqsEntry question={question} answer={answer} key={question} />
            ))}
          </div>
        </section>
      </div>

      <Script
        id="faqs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </main>
  );
};

export default page;
