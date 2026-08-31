"use client";
import { useDialog } from "@/contexts/DialogContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const EmailVerifiedWatcher = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { openDialog } = useDialog();

  useEffect(() => {
    if (searchParams.get("verified") !== "true") return;

    openDialog("email-verified");

    const params = new URLSearchParams(searchParams);
    params.delete("verified");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [searchParams, pathname, router, openDialog]);

  return null;
};

export default EmailVerifiedWatcher;
