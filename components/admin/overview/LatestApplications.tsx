import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ApplicationEntry from "./ApplicationEntry";

const LatestApplications = ({
  applications,
}: {
  applications: {
    id: string;
    name: string;
    specialty: string;
    date: string;
    status: "pending" | "approved" | "rejected";
  }[];
}) => {
  return (
    <div className="text-sm p-4 bg-primary-light rounded-2xl">
      <div className="flex mb-2 justify-between items-center">
        <h2 className="font-body! font-bold">Latest Applications</h2>
        <Link href={"/admin/applications"}>
          <p className="flex items-center gap-1 text-body hover:text-secondary transition-colors text-xs">
            Review All <ArrowRight size={12} />
          </p>
        </Link>
      </div>
      <div className="divide-y divide-secondary/20">
        {applications.map((application) => (
          <ApplicationEntry
            key={application.id}
            name={application.name}
            date={application.date}
            specialty={application.specialty}
            status={application.status}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestApplications;
