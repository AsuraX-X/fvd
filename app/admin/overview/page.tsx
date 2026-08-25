import ApplicationMix from "@/components/admin/overview/ApplicationMix";
import DataCard from "@/components/admin/overview/DataCard";
import LatestApplications from "@/components/admin/overview/LatestApplications";
import { BadgeCheck, CircleX, Clock, ShieldCheck, Users } from "lucide-react";

const page = () => {
  return (
    <div>
      <div className="flex gap-4">
        <DataCard
          data={2}
          label="Users"
          subtitle="registered accounts"
          Icon={Users}
        />
        <DataCard
          data={2}
          label="Experts"
          subtitle="live in directory"
          Icon={BadgeCheck}
        />
        <DataCard
          data={2}
          label="Pending"
          subtitle="awaiting review"
          Icon={Clock}
        />
        <DataCard
          data={2}
          label="Rejected"
          subtitle="declined"
          Icon={CircleX}
        />
        <DataCard
          data={2}
          label="Admins"
          subtitle="with full access"
          Icon={ShieldCheck}
        />
      </div>
      <div className="flex gap-4 pt-4">
        <div className="flex-6">
          <LatestApplications />
        </div>
        <div className="flex-3">
          <ApplicationMix approved={12} rejected={2} pending={8} />
        </div>
      </div>
    </div>
  );
};

export default page;
