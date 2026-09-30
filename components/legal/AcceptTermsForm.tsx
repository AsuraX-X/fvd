"use client";

import { acceptTerms, type AcceptTermsState } from "@/app/accept-terms/actions";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import TermsCheckbox from "./TermsCheckbox";

const initialState: AcceptTermsState = { success: false, message: "" };

const AcceptTermsForm = ({ next }: { next: string }) => {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [state, formAction, pending] = useActionState(
    acceptTerms,
    initialState,
  );

  const handleDecline = async () => {
    setDeclining(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="next" value={next} />
      <TermsCheckbox checked={accepted} onChange={setAccepted} />
      {state.message && (
        <p className="text-red-500 text-xs">{state.message}</p>
      )}
      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={!accepted || pending || declining}
          className="button-primary w-full font-bold disabled:opacity-50"
        >
          {pending ? "Saving..." : "Accept and continue"}
        </button>
        <button
          type="button"
          onClick={handleDecline}
          disabled={pending || declining}
          className="button-secondary w-full disabled:opacity-50"
        >
          {declining ? "Signing out..." : "Decline and sign out"}
        </button>
      </div>
    </form>
  );
};

export default AcceptTermsForm;
