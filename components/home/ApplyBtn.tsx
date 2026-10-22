"use client";
import { useDialog } from "@/contexts/DialogContext";
import { useRole } from "@/contexts/RoleContext";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { signInWithIntentPath } from "@/lib/terms";
import { usePathname, useRouter } from "next/navigation";

const ApplyBtn = ({
  content,
  variant,
  width,
}: {
  content: string;
  variant?: "primary" | "secondary";
  width?: number;
}) => {
  const { openDialog } = useDialog();
  const role = useRole();
  const router = useRouter();
  const pathname = usePathname();

  if (role === "EXPERT" || role === "ADMIN") return null;

  // `role` is null when signed out (or unverified); applying needs an account.
  // DialogIntentWatcher reopens the form once they're back.
  const handleClick = () =>
    role
      ? openDialog("apply")
      : router.push(signInWithIntentPath(pathname, "apply"));

  return (
    <motion.button
      initial={{ width }}
      whileHover={{ width: width && width + 10 }}
      transition={{ type: "spring", duration: 0.4, stiffness: 150 }}
      className={`flex items-center justify-between gap-1 text-nowrap ${variant === "secondary" ? "button-secondary" : "button-primary"}`}
      onClick={handleClick}
    >
      {content} <ArrowRight size={16} />
    </motion.button>
  );
};

export default ApplyBtn;
