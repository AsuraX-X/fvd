"use client";

import { authClient } from "@/lib/auth-client";
import Image from "next/image";

const GoogleSigninButton = () => {
  const handleGoogleSignin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
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
