import ApplicationEntry from "./ApplicationEntry";

const ApplicationList = () => {
  return (
    <div className="space-y-4 max-h-[80vh] my-4 overflow-scroll">
      <ApplicationEntry />
      <ApplicationEntry />
      <ApplicationEntry />
      <ApplicationEntry />
      <ApplicationEntry />
    </div>
  );
};

export default ApplicationList;
