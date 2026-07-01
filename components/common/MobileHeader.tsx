"use client";
import { links } from "@/constants";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Logo from "./Logo";

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  const parent = {
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", duration: 0.1 },
    },
    hidden: {
      opacity: 0,
      transition: { when: "afterChildren" },
      duration: 0.1,
    },
  };
  const child = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  const menuRef = useRef<HTMLDivElement | null>(null);

  const path = usePathname();

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "auto";
  }, []);

  const openMenu = () => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | null) => {
      // Check if the clicked element is NOT part of the ref target
      if (!menuRef.current || !event) return;

      const target = event.target;

      // event.target is of type EventTarget | null; ensure it's a Node before calling contains
      if (target instanceof Node && !menuRef.current.contains(target)) {
        closeMenu();
      }
    };

    // Bind the event listener to the document
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu]);

  return (
    <div className="flex items-center justify-between px-6  lg:hidden">
      <Logo />
      <div>
        <button onClick={() => openMenu()}>
          <Menu />
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={"modal"}
            variants={parent}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed top-0 left-0 z-20 flex justify-end w-screen h-screen bg-primary/80"
          >
            <AnimatePresence propagate>
              <motion.div
                variants={child}
                ref={menuRef}
                transition={{ ease: "easeInOut", duration: 0.3 }}
                className="h-full px-6 w-6/7 bg-primary-light"
              >
                <div className="flex items-center justify-between py-8">
                  <h2 className="text-2xl uppercase font-body!">Menu</h2>{" "}
                  <button onClick={() => closeMenu()}>
                    <X />
                  </button>
                </div>
                <div className="pb-10 border-b border-secondary-lighter/20">
                  <ul className="flex flex-col gap-8 text-body font-body">
                    {links.map(
                      ({ label, link }) =>
                        link !== path && (
                          <li key={label}>
                            <Link onClick={closeMenu} href={link}>
                              {label}
                            </Link>
                          </li>
                        ),
                    )}
                  </ul>
                </div>
                <div className="flex flex-col gap-2 py-6">
                  <button className="py-3 rounded-md button-secondary">
                    Sign In
                  </button>
                  <button className="py-3 rounded-md button-primary">
                    Work with us
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileHeader;
