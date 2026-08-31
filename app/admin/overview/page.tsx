import ApplicationMix from "@/components/admin/overview/ApplicationMix";
import DataCard from "@/components/admin/overview/DataCard";
import LatestApplications from "@/components/admin/overview/LatestApplications";
import { prisma } from "@/lib/prisma";
import {
  BadgeCheck,
  CircleX,
  Clock,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";

export const metadata = { title: "Overview" };

const page = async () => {
  const [
    usersCount,
    expertsCount,
    adminsCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    newEnquiriesCount,
    latestApplications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.profile.count({ where: { role: "EXPERT" } }),
    prisma.profile.count({ where: { role: "ADMIN" } }),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.application.count({ where: { status: "APPROVED" } }),
    prisma.application.count({ where: { status: "REJECTED" } }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <div>
      <div className="flex gap-4 md:flex-nowrap flex-wrap">
        <DataCard
          data={usersCount}
          label="Users"
          subtitle="registered accounts"
          Icon={Users}
        />
        <DataCard
          data={expertsCount}
          label="Experts"
          subtitle="live in directory"
          Icon={BadgeCheck}
        />
        <DataCard
          data={pendingCount}
          label="Pending"
          subtitle="awaiting review"
          Icon={Clock}
        />
        <DataCard
          data={rejectedCount}
          label="Rejected"
          subtitle="declined"
          Icon={CircleX}
        />
        <DataCard
          data={adminsCount}
          label="Admins"
          subtitle="with full access"
          Icon={ShieldCheck}
        />
        <DataCard
          data={newEnquiriesCount}
          label="Enquiries"
          subtitle="new & unread"
          Icon={Mail}
        />
      </div>
      <div className="flex md:flex-row flex-col gap-4 pt-4">
              <div className="md:flex-3">
                <ApplicationMix
                  approved={approvedCount}
                  rejected={rejectedCount}
                  pending={pendingCount}
                />
              </div>
        <div className="md:flex-6">
          <LatestApplications
            applications={latestApplications.map((application) => ({
              id: application.id,
              name: application.name,
              specialty: application.specialty,
              date: application.createdAt.toLocaleDateString(),
              status: application.status.toLowerCase() as
                | "pending"
                | "approved"
                | "rejected",
            }))}
          />
        </div>
      </div>
    </div>
  );
};

export default page;
