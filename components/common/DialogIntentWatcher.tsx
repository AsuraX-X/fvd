"use client";
import { useDialog } from "@/contexts/DialogContext";
import { useRole } from "@/contexts/RoleContext";
import { DIALOG_INTENTS, type DialogIntent } from "@/lib/terms";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const INTENT_DIALOGS: Record<
  DialogIntent,
  { type: string; props?: Record<string, unknown> }
> = {
  apply: { type: "apply" },
  enquiry: { type: "enquiry" },
  contact: { type: "enquiry", props: { briefLabel: "Message" } },
};

const isDialogIntent = (value: string | null): value is DialogIntent =>
  DIALOG_INTENTS.includes(value as DialogIntent);

// Signed-out visitors who click "Apply" / "Work with us" / "Contact us" are
// sent through sign-in with a return path carrying `?intent=<name>` (see
// signInWithIntentPath). Once they're back with a verified session, reopen
// that dialog so the flow continues where it left off.
const DialogIntentWatcher = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const role = useRole();
  const { openDialog } = useDialog();

  useEffect(() => {
    const intent = searchParams.get("intent");
    if (!isDialogIntent(intent)) return;
    // Not signed in (yet) — leave the param so it fires once they are.
    if (!role) return;

    // These dialogs are client-only; experts and admins just drop the intent.
    if (role === "USER") {
      const dialog = INTENT_DIALOGS[intent];
      openDialog(dialog.type, dialog.props);
    }

    const params = new URLSearchParams(searchParams);
    params.delete("intent");
    // The dialog takes over from the "email verified" welcome dialog.
    params.delete("verified");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [searchParams, pathname, router, role, openDialog]);

  return null;
};

export default DialogIntentWatcher;
