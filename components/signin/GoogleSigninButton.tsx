"use client";

import { authClient } from "@/lib/auth-client";
import { acceptTermsPath } from "@/lib/terms";
import Image from "next/image";

const GoogleSigninButton = ({ next = "/" }: { next?: string }) => {
  const handleGoogleSignin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: next,
        // OAuth sign-ups skip the sign-up form's terms checkbox.
        newUserCallbackURL: acceptTermsPath(next),
      });
    } catch (error) {
      console.error("Google signin failed:", error);
    }
  };

  return (
    <button
      onClick={handleGoogleSignin}
      className="button-primary font-bold justify-center py-2 w-full flex items-center gap-2"
    >
      <Image src="/ui/google.svg" alt="google icon" width={18} height={18} />{" "}
      Continue with Google
    </button>
  );
};

export default GoogleSigninButton;
