"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";

type SigninFormProps = {
  signin: boolean;
};

const SigninForm = ({ signin }: SigninFormProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError } = signin
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: email });

      if (authError) {
        setError(authError.message || "Authentication failed");
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
      <div className="flex flex-col">
        <label className="small-header text-[10px]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border-b  border-b-primary-lighter/50 focus:border-b-primary-lighter transition-colors focus:outline-0"
        />
      </div>
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
