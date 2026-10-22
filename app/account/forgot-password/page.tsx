import ForgotPasswordForm from "@/components/signin/ForgotPasswordForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Forgot password",
  description: "Reset the password for your FVD account.",
  alternates: { canonical: "/account/forgot-password" },
  robots: { index: false, follow: true },
};

const page = () => {
  return (
    <main className="py-50">
      <section className="max-w-lg px-8 mx-auto">
        <p className="small-header">Forgot Password</p>
        <h1 className="text-5xl italic mb-12">Reset your password</h1>
        <p className="text-body text-sm mb-10">
          Enter the email you signed up with and we&apos;ll send you a link to
          choose a new password.
        </p>
        <ForgotPasswordForm />
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
