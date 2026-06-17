import GoogleSigninButton from "@/components/signin/GoogleSigninButton";
import SigninForm from "@/components/signin/SigninForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const signin = params.signin === "true";

  return (
    <main className="py-50">
      <section className="max-w-lg px-8 mx-auto">
        <p className="small-header">
          {signin ? "Welcome Back" : "Create Account"}
        </p>
        <h1 className="text-5xl italic mb-12">
          {signin ? "Sign in" : "Join FVDlance"}
        </h1>
        <GoogleSigninButton />
        <div className="py-10 flex items-center gap-4 justify-center">
          <div className="h-px bg-primary-light w-full" />
          <p className="text-body text-xs">or</p>
          <div className="h-px bg-primary-light w-full" />
        </div>
        <div>
          <SigninForm signin={signin} />
        </div>{" "}
        <div className="flex text-xs gap-1 justify-center py-6 ">
          <p className="text-body">
            {signin ? "New Here? " : "Already have an account? "}
          </p>
          <Link
            href={signin ? "/account?signin=false" : "/account?signin=true"}
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
