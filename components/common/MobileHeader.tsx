"use client";
import { links, UserProfile } from "@/constants";
import { useDialog } from "@/contexts/DialogContext";
import { useRole } from "@/contexts/RoleContext";
import { authClient } from "@/lib/auth-client";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AvatarImage from "./AvatarImage";
import Logo from "./Logo";

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setProfileIsOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const { openDialog } = useDialog();
  const role = useRole();
  const router = useRouter();
  const user = (
    session?.user.emailVerified ? session.user : null
  ) as UserProfile | null;

  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/");
      setIsOpen(false);
    } catch (error) {
      console.error("Sign out failed", error);
    } finally {
      setSigningOut(false);
    }
  };

  const profileRef = useRef<HTMLDivElement | null>(null);

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
    <div className="flex items-center justify-between  lg:hidden">
      <Link href={"/"}>
        <Logo />
      </Link>
      <div className="flex items-center gap-2">
        <div>
          <div className="h-6">
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
                      {user ? (
                        <button
                          onClick={handleSignOut}
                          className="py-3 w-full rounded-md button-secondary"
                        >
                          {signingOut ? "Signing out..." : "Sign out"}
                        </button>
                      ) : (
                        <Link
                          onClick={closeMenu}
                          className="flex-1"
                          href={"/account?signin=true"}
                        >
                          <button className="py-3 w-full rounded-md button-secondary">
                            Sign In
                          </button>
                        </Link>
                      )}
                      {role !== "EXPERT" && role !== "ADMIN" && (
                        <button
                          onClick={() => {
                            closeMenu();
                            if (!role) {
                              router.push("/account?signin=true");
                              return;
                            }
                            openDialog("enquiry");
                          }}
                          className="py-3 rounded-md button-primary"
                        >
                          Work with us
                        </button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div>
          {user ? (
            <div
              ref={profileRef}
              onClick={() => setProfileIsOpen(!isProfileOpen)}
              className="rounded-full size-10 cursor-pointer border border-secondary/0 hover:border-secondary transition-colors bg-gray-600 relative text-white flex items-center justify-center"
            >
              {user.image ? (
                <AvatarImage
                  key={user.image}
                  src={user.image}
                  alt="profile image"
                  className="absolute rounded-full inset-0 h-full w-full object-cover"
                  fallback={
                    <span className="font-semibold">
                      {(user.name || user.email || "U")[0].toUpperCase()}
                    </span>
                  }
                />
              ) : (
                <span className=" font-semibold">
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </span>
              )}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-primary-light  overflow-hidden min-w-60 right-0 mt-4 pt-2 text-sm rounded-2xl absolute top-full"
                  >
                    <p className="text-body text-xs py-2 px-4 border-b border-b-secondary/20">
                      {user.email}
                    </p>
                    <ul className="w-full">
                      {role === "ADMIN" && (
                        <li>
                          <Link href={"/admin/overview"}>
                            <p className="py-3 w-full text-secondary text-left px-4 hover:bg-secondary/10 transition-colors">
                              Admin
                            </p>
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link href={"/dashboard/experts"}>
                          <p className="py-3 w-full text-secondary text-left px-4 hover:bg-secondary/10 transition-colors">
                            Dashboard
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link href={"/dashboard/messages"}>
                          <p className="py-3 w-full text-secondary text-left px-4 hover:bg-secondary/10 transition-colors">
                            Messages
                          </p>
                        </Link>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          disabled={signingOut}
                          aria-busy={signingOut}
                          className={`py-3 w-full text-left px-4 hover:bg-secondary/10 text-secondary transition-colors border-t border-t-secondary/20 ${signingOut ? "opacity-60 pointer-events-none" : ""}`}
                        >
                          {signingOut ? "    Signing out..." : "Sign out"}
                        </button>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
