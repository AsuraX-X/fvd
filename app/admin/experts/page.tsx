import SearchInput from "@/components/admin/SearchInput";
import ExpertCard from "@/components/admin/experts/ExpertCard";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Experts" };

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const { q } = await searchParams;

  const where: Prisma.ProfileWhereInput = { role: "EXPERT" };

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { surname: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { specialty: { contains: q, mode: "insensitive" } },
    ];
  }

  const experts = await prisma.profile.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div>
        <SearchInput
          placeholder="Search by name, skill..."
          className="border text-sm border-primary-lighter/50 px-4 sm:w-80 w-full py-2 rounded-full focus:border-primary-lighter transition-colors focus:outline-0"
        />
      </div>
      {experts.length === 0 ? (
        <p className="text-sm text-body py-8 text-center">
          No experts match your search.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mt-4">
          {experts.map((expert) => (
            <ExpertCard
              key={expert.id}
              id={expert.id}
              name={`${expert.firstName} ${expert.surname}`.trim()}
              email={expert.email}
              specialty={expert.specialty ?? "Generalist"}
              bio={expert.bio ?? ""}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default page;
