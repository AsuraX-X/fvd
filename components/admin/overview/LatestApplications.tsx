import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ApplicationEntry from "./ApplicationEntry";

const LatestApplications = () => {
  return (
    <div className="text-sm p-4 bg-primary-light rounded-2xl">
      <div className="flex mb-2 justify-between items-center">
        <h2 className="font-body! font-bold">Latest Applications</h2>
        <Link href={"/"}>
          <p className="flex items-center gap-1 text-body hover:text-secondary transition-colors text-xs">
            Review All <ArrowRight size={12} />
          </p>
        </Link>
      </div>
      <div className="divide-y divide-secondary/20">
        <ApplicationEntry
          name="Lina Fernandes"
          date="8/25/2026"
          specialty="Experiential Production"
          status="pending"
        />
        <ApplicationEntry
          name="Lina Fernandes"
          date="8/25/2026"
          specialty="Experiential Production"
          status="pending"
        />
        <ApplicationEntry
          name="Lina Fernandes"
          date="8/25/2026"
          specialty="Experiential Production"
          status="approved"
        />
        <ApplicationEntry
          name="Lina Fernandes"
          date="8/25/2026"
          specialty="Experiential Production"
          status="rejected"
        />
      </div>
    </div>
  );
};

export default LatestApplications;
