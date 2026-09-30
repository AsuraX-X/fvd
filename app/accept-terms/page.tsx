import AcceptTermsForm from "@/components/legal/AcceptTermsForm";
import { auth } from "@/lib/auth";
import { hasAcceptedTerms, safeNextPath } from "@/lib/terms";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Accept our terms",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const page = async ({ searchParams }: PageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });
  const next = safeNextPath((await searchParams).next);

  if (!session) {
    redirect("/account?signin=true");
  }

  if (hasAcceptedTerms(session.user)) {
    redirect(next);
  }

  const returning = Boolean(session.user.termsAcceptedAt);

  return (
    <main className="py-50">
      <section className="max-w-lg px-8 mx-auto">
        <p className="small-header">
          {returning ? "We've updated our terms" : "One last step"}
        </p>
        <h1 className="text-5xl italic mb-6">Before you continue</h1>
        <p className="text-sm text-body leading-7 mb-10">
          {returning
            ? "Our Terms of Service and Privacy Policy have changed. Please review and accept them to keep using your account."
            : "To use your FVDlance account you need to accept our Terms of Service and Privacy Policy."}{" "}
          If you don&apos;t agree, you can sign out — you&apos;ll still be able
          to browse experts, but not message, review, save or apply.
        </p>
        <AcceptTermsForm next={next} />
      </section>
    </main>
  );
};

export default page;
