import SearchInput from "@/components/admin/SearchInput";
import UserCard from "@/components/admin/users/UserCard";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Users" };

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const { q } = await searchParams;

  const where: Prisma.ProfileWhereInput = {};

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { surname: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { specialty: { contains: q, mode: "insensitive" } },
    ];
  }

  const users = await prisma.profile.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="w-full">
        <SearchInput
          placeholder="Search by name, skill..."
          className="border text-sm border-primary-lighter/50 px-4 sm:w-80 w-full py-2 rounded-full focus:border-primary-lighter transition-colors focus:outline-0"
        />
      </div>
      {users.length === 0 ? (
        <p className="text-sm text-body py-8 text-center">
          No users match your search.
        </p>
      ) : (
        <div className="mt-2 space-y-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              id={user.id}
              name={`${user.firstName} ${user.surname}`.trim()}
              email={user.email}
              role={user.role.toLowerCase() as "admin" | "expert" | "user"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default page;
