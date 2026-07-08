"use client";
import { dashBoardLinks } from "@/constants";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DashBoardNav = () => {
  const pathname = usePathname();

  return (
    <nav className="my-4">
      <ul className="flex">
        {dashBoardLinks.map(({ label, link }) => (
          <li key={label}>
            <Link href={link}>
              <motion.p
                animate={{
                  color:
                    link === pathname
                      ? "var(--color-secondary)"
                      : "var(--color-body)",

                  borderColor:
                    link === pathname
                      ? "var(--color-secondary)"
                      : "var(--color-primary-light)",
                }}
                whileHover={{
                  color: "var(--color-secondary)",
                  borderColor:
                    link !== pathname
                      ? "color-mix(in oklab, var(--color-secondary) 50%, transparent)"
                      : "var(--color-secondary)",
                }}
                className="text-sm px-6 py-2 text-body border-b"
              >
                {label}
              </motion.p>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DashBoardNav;
