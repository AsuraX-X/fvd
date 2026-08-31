import EnquiryList from "@/components/admin/enquiries/EnquiryList";
import Filters from "@/components/admin/enquiries/Filters";
import SearchInput from "@/components/admin/SearchInput";
import { EnquiryStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Enquiries" };

const STATUS_FILTERS = ["new", "read", "archived"];

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) => {
  const { status, q } = await searchParams;

  const where: Prisma.EnquiryWhereInput = {};

  if (status && STATUS_FILTERS.includes(status)) {
    where.status = status.toUpperCase() as EnquiryStatus;
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { brief: { contains: q, mode: "insensitive" } },
    ];
  }

  const enquiries = await prisma.enquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-between">
        <Filters />
        <SearchInput />
      </div>
      <div>
        <EnquiryList
          enquiries={enquiries.map((enquiry) => ({
            id: enquiry.id,
            name: enquiry.name,
            email: enquiry.email,
            brief: enquiry.brief,
            status: enquiry.status.toLowerCase() as
              | "new"
              | "read"
              | "archived",
            date: enquiry.createdAt.toLocaleDateString(),
          }))}
        />
      </div>
    </div>
  );
};

export default page;
