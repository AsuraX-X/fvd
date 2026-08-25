import ApplicationList from "@/components/admin/applications/ApplicationList";
import Filters from "@/components/admin/applications/Filters";

const page = () => {
  return (
    <div>
      <div className="flex justify-between">
        <Filters />
        <input
          type="text"
          name="query"
          id="query"
          placeholder="Search..."
          className="border text-sm border-primary-lighter/50 px-4 w-80 py-1 rounded-full focus:border-primary-lighter transition-colors focus:outline-0"
        />
      </div>
      <div>
        <ApplicationList/>
      </div>
    </div>
  );
};

export default page;
