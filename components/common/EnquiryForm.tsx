"use client";

import { submitEnquiry, type EnquiryFormState } from "./actions";
import { useDialog } from "@/contexts/DialogContext";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

const initialState: EnquiryFormState = null;

const EnquiryForm = ({
  close,
  briefLabel = "Project brief",
}: {
  close: () => void;
  briefLabel?: string;
}) => {
  const { openDialog } = useDialog();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    submitEnquiry,
    initialState,
  );

  useEffect(() => {
    if (state?.success) {
      close();
      openDialog("enquiry-success");
    } else if (state?.code === "UNAUTHENTICATED") {
      close();
      router.push("/account?signin=true");
    }
  }, [state, close, openDialog, router]);

  return (
    <form className="space-y-4" action={formAction}>
      <div>
        <label className="form-label mb-2" htmlFor="enquiry-name">
          Full Name *
        </label>
        <input
          type="text"
          className="form-input w-full min-w-70"
          name="name"
          id="enquiry-name"
          required
        />
      </div>
      <div>
        <label className="form-label mb-2" htmlFor="enquiry-email">
          Email *
        </label>
        <input
          type="email"
          className="form-input w-full min-w-70"
          name="email"
          id="enquiry-email"
          required
        />
      </div>
      <div>
        <label className="form-label mb-2" htmlFor="enquiry-brief">
          {briefLabel} *
        </label>
        <textarea
          className="text-sm w-full resize-none border border-secondary/20 focus-visible:border-secondary transition-colors focus-visible:outline-none rounded-lg p-2"
          name="brief"
          id="enquiry-brief"
          maxLength={1200}
          rows={5}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        {state && !state.success && (
          <p className="text-sm text-[#d35555]">{state.message}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="button-primary w-full disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send enquiry"}
        </button>
      </div>
    </form>
  );
};

export default EnquiryForm;
