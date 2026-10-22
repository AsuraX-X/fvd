"use client";

import { authClient } from "@/lib/auth-client";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useState, type SyntheticEvent } from "react";

const ResetPasswordForm = ({ token }: { token: string }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error: authError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (authError) {
      setError(authError.message || "Failed to reset password");
    } else {
      setDone(true);
    }

    setLoading(false);
  };

  if (done) {
    return (
      <div className="space-y-8">
        <p className="text-body text-sm">
          Your password has been reset. You can now sign in with your new
          password.
        </p>
        <Link
          href="/account?signin=true"
          className="button-primary block w-full font-bold text-center"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex flex-col">
        <label className="small-header text-[10px]" htmlFor="password">
          New Password
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
      <button
        type="submit"
        disabled={loading}
        className="button-primary w-full font-bold disabled:opacity-50"
      >
        {loading ? "Saving..." : "Reset password"}
      </button>
    </form>
  );
};

export default ResetPasswordForm;
