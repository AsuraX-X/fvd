import AdminNav from "@/components/admin/AdminNav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export const metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

const Admin = async ({ children }: { children: ReactNode }) => {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || !session.user.emailVerified) {
    redirect("/account?signin=true");
  }

  const user = session.user;

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { role: true },
  });

  if (profile?.role !== "ADMIN") {
    redirect("/dashboard/experts");
  }

  return (
    <main className="py-30 divide-y divide-secondary/10">
      <section>
        <div className="max-w-7xl px-8 py-20 mx-auto">
          <p className="small-header">ADMIN</p>
          <h1 className="text-6xl italic">{user.name || user.email}</h1>
        </div>
      </section>
      <section className="max-w-7xl px-8 mx-auto">
        <AdminNav />
        {children}
      </section>
    </main>
  );
};

export default Admin;
