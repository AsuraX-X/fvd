"use client";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Filters = () => {
  const filters = ["approved", "pending", "rejected"];

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = searchParams.get("status") ?? "";

  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-x-1">
      <motion.button
        initial={{
          backgroundColor: "var(--color-primary-light)",
          borderColor: "var(--color-primary-light)",
        }}
        whileHover={{
          borderColor: filter === "" ? "var(--color-secondary)" : "#474747",
        }}
        animate={{
          backgroundColor:
            filter === ""
              ? "var(--color-secondary)"
              : "var(--color-primary-light)",
          color: filter === "" ? "var(--color-primary)" : "var(--color-body)",
          borderColor:
            filter === ""
              ? "var(--color-secondary)"
              : "var(--color-primary-light)",
        }}
        onClick={() => setFilter("")}
        className="uppercase rounded-full px-3 py-1 border tracking-widest text-body text-sm"
      >
        All
      </motion.button>
      {filters.map((f, i) => (
        <motion.button
          initial={{
            backgroundColor: "var(--color-primary-light)",
            borderColor: "var(--color-primary-light)",
          }}
          whileHover={{
            borderColor: filter === f ? "var(--color-secondary)" : "#474747",
          }}
          animate={{
            backgroundColor:
              filter === f
                ? "var(--color-secondary)"
                : "var(--color-primary-light)",
            color: filter === f ? "var(--color-primary)" : "var(--color-body)",
            borderColor:
              filter === f
                ? "var(--color-secondary)"
                : "var(--color-primary-light)",
          }}
          onClick={() => setFilter(f)}
          className="uppercase rounded-full px-3 py-1 border tracking-widest text-body text-sm"
          key={i}
        >
          {f}
        </motion.button>
      ))}
    </div>
  );
};

export default Filters;
