"use client";
import { links, UserProfile } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AvatarImage from "./AvatarImage";
import Logo from "./Logo";
import MobileHeader from "./MobileHeader";

const Header = () => {
  const path = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Sign out failed", error);
    } finally {
      setSigningOut(false);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await authClient.getSession();

        if (session?.data?.user) {
          setUser(session.data.user as UserProfile);
        }
      } catch (error) {
        console.error("Failed to load auth session", error);
      } finally {
        setLoaded(true);
      }
    };

    loadSession();
  }, []);

  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | null) => {
      // Check if the clicked element is NOT part of the ref target
      if (!profileRef.current || !event) return;

      const target = event.target;

      // event.target is of type EventTarget | null; ensure it's a Node before calling contains
      if (target instanceof Node && !profileRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    // Bind the event listener to the document
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsOpen]);

  return (
    <nav className="fixed top-0 left-0 py-4 right-0 px-8 z-10 border-b border-b-primary-light bg-primary/40 backdrop-blur-xl ">
      <div className="items-center justify-between hidden  lg:flex max-w-7xl mx-auto ">
        <Link href={"/"}>
          <Logo />
        </Link>
        <div className="flex justify-center flex-1">
          <ul className="flex gap-8">
            {links.map(
              ({ label, link }) =>
                path !== link && (
                  <li key={label}>
                    <Link className="link" href={link}>
                      {label}
                    </Link>
                  </li>
                ),
            )}
          </ul>
        </div>
        <div className="space-x-4 flex items-center">
          {!loaded ? (
            <div className="flex items-center gap-3" aria-hidden="true">
              <div className="h-10 w-10 rounded-full bg-secondary/15 animate-pulse" />
            </div>
          ) : !user ? (
            <Link href={"/account?signin=true"} className="link">
              Sign In
            </Link>
          ) : null}
          {user ? (
            <div
              ref={profileRef}
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full size-10 cursor-pointer border border-secondary/0 hover:bg-secondary transition-colors bg-gray-600 relative text-white flex items-center justify-center"
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
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-primary-light  overflow-hidden min-w-60 left-0 mt-4 pt-2 text-sm rounded-2xl absolute top-full"
                  >
                    <p className="text-body text-xs py-2 px-4 border-b border-b-secondary/20">
                      {user.email}
                    </p>
                    <ul className="w-full">
                      <li>
                        <Link href={"/dashboard/experts"}>
                          <p className="py-3 w-full text-secondary text-left px-4 hover:bg-secondary/10 transition-colors">
                            Dashboard
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link href={"/"}>
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
                          {signingOut ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                              </svg>
                              Signing out...
                            </span>
                          ) : (
                            "Sign out"
                          )}
                        </button>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}
          <button className="button-primary">Work with us</button>
        </div>
      </div>
      <MobileHeader />
    </nav>
  );
};

export default Header;
