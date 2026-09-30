import DashBoardNav from "@/components/dashboard/DashBoardNav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { acceptTermsPath, hasAcceptedTerms } from "@/lib/terms";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export const metadata = {
  title: { default: "Dashboard", template: "%s | Dashboard" },
  robots: { index: false, follow: false },
};

const Dashboard = async ({ children }: { children: ReactNode }) => {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || !session.user.emailVerified) {
    redirect("/account?signin=true");
  }

  if (!hasAcceptedTerms(session.user)) {
    redirect(acceptTermsPath());
  }

  const user = session.user;

  // Fetch user profile to get role
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { role: true, listingStatus: true },
  });

  const roleDisplay = {
    USER: "Client",
    EXPERT: "Expert",
    ADMIN: "Admin",
  };

  const userRole = (profile?.role as keyof typeof roleDisplay) || "USER";
  const displayRole = roleDisplay[userRole];

  const listingDisplay = {
    LISTED: "Listed",
    UNLISTED_BY_EXPERT: "Unlisted",
    UNLISTED_BY_ADMIN: "Unlisted by admin",
  };

  return (
    <main className="py-30 divide-y divide-secondary/10">
      <section>
        <div className="max-w-7xl px-8 py-20 mx-auto">
          <p className="small-header">Your space</p>
          <h1 className="sm:text-6xl text-5xl italic">{user.name || user.email}</h1>
          <div className="flex flex-wrap gap-2 mt-4">
            <p className="bg-primary-light rounded-full border border-secondary/20 w-fit py-1 px-2 uppercase text-xs">
              {displayRole}
            </p>
            {profile?.role === "EXPERT" && (
              <Link
                href="/dashboard/profile"
                title="Manage your listing in Profile → Danger Zone"
                className={`bg-primary-light rounded-full border w-fit py-1 px-2 uppercase text-xs transition-colors ${
                  profile.listingStatus === "LISTED"
                    ? "border-secondary/20 hover:border-secondary"
                    : "border-[#e7000b]/60 text-[#e7000b] hover:border-[#e7000b]"
                }`}
              >
                {listingDisplay[profile.listingStatus]}
              </Link>
            )}
          </div>
        </div>
      </section>
      <section className="max-w-7xl px-8 mx-auto">
        <DashBoardNav />
        {children}
      </section>
    </main>
  );
};

export default Dashboard;
