"use client";

import { authClient } from "@/lib/auth-client";
import { useState, type SyntheticEvent } from "react";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/account/reset-password",
    });

    if (authError) {
      setError(authError.message || "Failed to send reset email");
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  if (sent) {
    return (
      <p className="text-body text-sm">
        If an account exists for <strong>{email}</strong>, we&apos;ve sent a
        link to reset your password. Please check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <p className="text-red-500 text-xs">{error}</p>}
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
      <button
        type="submit"
        disabled={loading}
        className="button-primary w-full font-bold disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
