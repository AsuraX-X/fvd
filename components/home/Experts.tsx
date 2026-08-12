import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ExpertCard from "./ExpertCard";

const pickRandom = <T,>(items: T[], count: number): T[] => {
  return items
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, count)
    .map(({ item }) => item);
};

const Experts = async () => {
  const experts = await prisma.profile.findMany({
    where: { role: "EXPERT", selectedProjects: { some: {} } },
    include: { selectedProjects: true },
  });

  const randomExperts = pickRandom(experts, 3);

  if (randomExperts.length === 0) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="px-8 mx-auto max-w-7xl">
        <div className="flex flex-col justify-between w-full gap-6 lg:gap-0 lg:items-end lg:flex-row">
          <div className="">
            <p className="small-header">
              Curated network
            </p>
            <h2 className="text-5xl font-medium font-body!">
              The Expert Directory
            </h2>
          </div>
          <Link
            href={"/experts"}
            className="pb-1 text-sm transition-colors border-b w-fit border-b-primary-lighter/20 hover:border-b-primary-lighter"
          >
            View all experts
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-2 lg:grid-cols-3">
          {randomExperts.map((expert) => (
            <ExpertCard
              key={expert.id}
              id={expert.id}
              name={`${expert.firstName} ${expert.surname}`.trim()}
              headline={expert.headline}
              avatar={expert.avatar}
              projectImage={pickRandom(expert.selectedProjects, 1)[0]?.imageUrl ?? null}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experts;
