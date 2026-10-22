import ResetPasswordForm from "@/components/signin/ResetPasswordForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Reset password",
  description: "Choose a new password for your FVD account.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  // better-auth redirects here with `?token=...`, or `?error=INVALID_TOKEN`
  // when the emailed link is expired or already used.
  const token = typeof params.token === "string" ? params.token : null;

  return (
    <main className="py-50">
      <section className="max-w-lg px-8 mx-auto">
        <p className="small-header">Reset Password</p>
        <h1 className="text-5xl italic mb-12">Choose a new password</h1>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="space-y-8">
            <p className="text-body text-sm">
              This reset link is invalid or has expired. Please request a new
              one.
            </p>
            <Link
              href="/account/forgot-password"
              className="button-primary block w-full font-bold text-center"
            >
              Request a new link
            </Link>
          </div>
        )}
        <Link
          href="/account?signin=true"
          className="flex link items-center justify-center text-body gap-1 text-[10px] py-6"
        >
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </section>
    </main>
  );
};

export default page;
