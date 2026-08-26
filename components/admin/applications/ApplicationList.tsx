import ApplicationEntry from "./ApplicationEntry";

const ApplicationList = ({
  applications,
}: {
  applications: {
    id: string;
    name: string;
    email: string;
    specialty: string;
    bio: string;
    portfolioUrl: string | null;
    status: "pending" | "approved" | "rejected";
    links: { name: string; link: string }[];
  }[];
}) => {
  if (applications.length === 0) {
    return (
      <p className="text-sm text-body py-8 text-center">
        No applications match your filters.
      </p>
    );
  }

  return (
    <div className="space-y-4 max-h-[80vh] my-4 overflow-scroll">
      {applications.map((application) => (
        <ApplicationEntry key={application.id} {...application} />
      ))}
    </div>
  );
};

export default ApplicationList;
