import GoogleSigninButton from "@/components/signin/GoogleSigninButton";
import SigninForm from "@/components/signin/SigninForm";
import { safeNextPath } from "@/lib/terms";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Sign in",
  description: "Sign in or create an account on FVD.",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: true },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const signin = params.signin === "true";
  // Where to land after signing in/up, e.g. back on the page they clicked
  // "Apply" on (with `?apply=true` so the form reopens).
  const next =
    typeof params.next === "string" ? safeNextPath(params.next) : "/";
  const nextQuery = next === "/" ? "" : `&next=${encodeURIComponent(next)}`;

  return (
    <main className="py-50">
      <section className="max-w-lg px-8 mx-auto">
        <p className="small-header">
          {signin ? "Welcome Back" : "Create Account"}
        </p>
        <h1 className="text-5xl italic mb-12">
          {signin ? "Sign in" : "Join FVDlance"}
        </h1>
        <GoogleSigninButton next={next} />
        <div className="py-10 flex items-center gap-4 justify-center">
          <div className="h-px bg-primary-light w-full" />
          <p className="text-body text-xs">or</p>
          <div className="h-px bg-primary-light w-full" />
        </div>
        <div>
          <SigninForm signin={signin} next={next} />
        </div>{" "}
        <div className="flex text-xs gap-1 justify-center py-6 ">
          <p className="text-body">
            {signin ? "New Here? " : "Already have an account? "}
          </p>
          <Link
            href={`/account?signin=${signin ? "false" : "true"}${nextQuery}`}
            className="hover:border-b-secondary-lighter border-b border-b-primary transition-colors"
          >
            {signin ? "Create an account" : "Sign in"}
          </Link>
        </div>
        <Link
          href={"/"}
          className="flex link items-center justify-center text-body gap-1 text-[10px]"
        >
          <ArrowLeft size={14} /> Back home
        </Link>
      </section>
    </main>
  );
};

export default page;
