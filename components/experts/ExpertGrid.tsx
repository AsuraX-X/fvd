import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import ExpertCard from "./ExpertCard";

const ExpertGrid = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  const experts = await prisma.profile.findMany({
    where: { role: "EXPERT" },
    orderBy: { createdAt: "desc" },
  });

  const savedExpertIds = session
    ? new Set(
        (
          await prisma.savedExpert.findMany({
            where: {
              userId: session.user.id,
              expertId: { in: experts.map((expert) => expert.id) },
            },
            select: { expertId: true },
          })
        ).map((saved) => saved.expertId),
      )
    : new Set<string>();

  if (experts.length === 0) {
    return (
      <section className="py-20 border-y border-y-secondary/10 text-center text-body">
        No experts to show yet.
      </section>
    );
  }

  return (
    <section className="grid lg:grid-cols-3 gap-8 py-20 border-y border-y-secondary/10 place-items-center md:grid-cols-2 grid-cols-1">
      {experts.map((expert) => (
        <ExpertCard
          key={expert.id}
          id={expert.id}
          specialty={expert.specialty}
          profileImage={expert.avatar}
          name={`${expert.firstName} ${expert.surname}`.trim()}
          bio={expert.bio}
          rate={expert.rate}
          isSaved={savedExpertIds.has(expert.id)}
        />
      ))}
    </section>
  );
};

export default ExpertGrid;
