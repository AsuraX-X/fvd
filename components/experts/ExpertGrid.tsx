import { prisma } from "@/lib/prisma";
import ExpertCard from "./ExpertCard";

const ExpertGrid = async () => {
  const experts = await prisma.profile.findMany({
    where: { role: "EXPERT" },
    orderBy: { createdAt: "desc" },
  });

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
        />
      ))}
    </section>
  );
};

export default ExpertGrid;
