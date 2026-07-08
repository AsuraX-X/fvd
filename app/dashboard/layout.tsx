import DashBoardNav from "@/components/dashboard/DashBoardNav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const Dashboard = async ({ children }: { children: ReactNode }) => {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    redirect("/account?signin=true");
  }

  const user = session.user;

  // Fetch user profile to get role
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { role: true },
  });

  const roleDisplay = {
    USER: "Client",
    EXPERT: "Expert",
    ADMIN: "Admin",
  };

  const userRole = (profile?.role as keyof typeof roleDisplay) || "USER";
  const displayRole = roleDisplay[userRole];

  return (
    <main className="py-30 divide-y divide-secondary/10">
      <section>
        <div className="max-w-7xl px-8 py-20 mx-auto">
          <p className="small-header">Your space</p>
          <h1 className="text-6xl italic">{user.name || user.email}</h1>
          <p className="bg-primary-light rounded-full border border-secondary/20 w-fit py-1 px-2 mt-4 uppercase text-xs">
            {displayRole}
          </p>
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
