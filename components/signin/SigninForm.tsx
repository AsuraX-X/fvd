"use client";

import { authClient } from "@/lib/auth-client";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";

type SigninFormProps = {
  signin: boolean;
};

const SigninForm = ({ signin }: SigninFormProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    setResending(true);
    setError("");

    const { error: authError } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/dashboard?verified=true",
    });

    if (authError) {
      setError(authError.message || "Failed to resend verification email");
    } else {
      setVerificationSent(true);
    }

    setResending(false);
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setVerificationSent(false);

    if (!signin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = signin
        ? await authClient.signIn.email({
            email,
            password,
            callbackURL: "/",
          })
        : await authClient.signUp.email({
            email,
            password,
            name: email,
            callbackURL: "/?verified=true",
          });

      if (authError) {
        if (authError.code === "EMAIL_NOT_VERIFIED") {
          // A fresh verification email was already sent by the server (sendOnSignIn).
          setNeedsVerification(true);
        }
        setError(authError.message || "Authentication failed");
        setLoading(false);
        return;
      }

      if (!signin) {
        setVerificationSent(true);
        setLoading(false);
        return;
      }

      router.push("/");
    } catch (err) {
      console.error(err);

      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <p className="text-body text-sm">
        We&apos;ve sent a verification link to <strong>{email}</strong>. Please
        check your inbox to activate your account.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <p className="text-red-500 text-xs">{error}</p>}
      {needsVerification && (
        <div className="text-xs space-y-1">
          <p className="text-body">
            We sent a verification link to this email when you tried to sign in.
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending}
            className="link disabled:opacity-50"
          >
            {resending ? "Sending..." : "Didn't get it? Resend"}
          </button>
        </div>
      )}
      <div className="flex flex-col">
        <label className="small-header text-[10px]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-b  border-b-primary-lighter/50 focus:border-b-primary-lighter transition-colors focus:outline-0"
        />
      </div>
      <div className="flex flex-col">
        <label className="small-header text-[10px]" htmlFor="password">
          Password
        </label>
        <div className="border-b flex justify-between gap-2  border-b-primary-lighter/50 has-focus:border-b-primary-lighter transition-colors has-focus:outline-0">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="flex-1 focus:outline-0"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowPassword(!showPassword);
            }}
          >
            {showPassword ? <Eye size={16} /> : <EyeClosed size={16} />}
          </button>
        </div>
      </div>
      {!signin && (
        <div className="flex flex-col">
          <label className="small-header text-[10px]" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="border-b flex justify-between gap-2  border-b-primary-lighter/50 has-focus:border-b-primary-lighter transition-colors has-focus:outline-0">
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="flex-1 focus:outline-0"
            />
          </div>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="button-primary w-full font-bold disabled:opacity-50"
      >
        {loading ? "Loading..." : signin ? "Sign in" : "Create account"}
      </button>
    </form>
  );
};

export default SigninForm;
