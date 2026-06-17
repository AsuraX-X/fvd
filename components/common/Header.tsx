"use client";
import { links } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Logo from "./Logo";
import MobileHeader from "./MobileHeader";

type UserProfile = {
  name?: string;
  email?: string;
  image?: string;
};

const Header = () => {
  const path = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 ">
      <div className="items-center justify-between hidden py-3 border-b lg:flex px-30 border-b-primary-light bg-primary/40 backdrop-blur-xl">
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
          {!user && loaded ? (
            <Link href={"/account?signin=true"} className="link">
              Sign In
            </Link>
          ) : null}
          {user ? (
            <div className="rounded-full size-10 bg-gray-600 relative overflow-hidden text-white font-semibold flex items-center justify-center">
              {user.image ? (
                <img
                  src={user.image}
                  alt="profile image"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <span>{(user.name || user.email || "U")[0].toUpperCase()}</span>
              )}
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
