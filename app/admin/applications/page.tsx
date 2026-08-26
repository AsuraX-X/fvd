import ApplicationList from "@/components/admin/applications/ApplicationList";
import Filters from "@/components/admin/applications/Filters";
import SearchInput from "@/components/admin/SearchInput";
import { ApplicationStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const STATUS_FILTERS = ["pending", "approved", "rejected"];

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) => {
  const { status, q } = await searchParams;

  const where: Prisma.ApplicationWhereInput = {};

  if (status && STATUS_FILTERS.includes(status)) {
    where.status = status.toUpperCase() as ApplicationStatus;
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { specialty: { contains: q, mode: "insensitive" } },
    ];
  }

  const applications = await prisma.application.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { links: { orderBy: { order: "asc" } } },
  });

  return (
    <div>
      <div className="flex justify-between">
        <Filters />
        <SearchInput />
      </div>
      <div>
        <ApplicationList
          applications={applications.map((application) => ({
            id: application.id,
            name: application.name,
            email: application.email,
            specialty: application.specialty,
            bio: application.bio,
            portfolioUrl: application.portfolioUrl,
            status: application.status.toLowerCase() as
              | "pending"
              | "approved"
              | "rejected",
            links: application.links.map((link) => ({
              name: link.label,
              link: link.url,
            })),
          }))}
        />
      </div>
    </div>
  );
};

export default page;
