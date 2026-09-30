import ExpertCard from "@/components/dashboard/experts/ExpertCard";
import { auth } from "@/lib/auth";
import { PUBLIC_EXPERT_WHERE } from "@/lib/experts";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = { title: "Saved Experts" };

const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/account?signin=true");
  }

  const savedExperts = await prisma.savedExpert.findMany({
    where: { userId: session.user.id, expert: PUBLIC_EXPERT_WHERE },
    include: { expert: true },
    orderBy: { createdAt: "desc" },
  });

  if (savedExperts.length === 0) {
    return (
      <p className="text-body text-center py-20">
        You haven&apos;t saved any experts yet.
      </p>
    );
  }

  return (
    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {savedExperts.map(({ expert }) => (
        <ExpertCard
          key={expert.id}
          id={expert.id}
          name={`${expert.firstName} ${expert.surname}`.trim()}
          headline={expert.headline ?? expert.specialty}
          avatar={expert.avatar}
        />
      ))}
    </div>
  );
};

export default page;
