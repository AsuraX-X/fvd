import Link from "next/link";
import ExpertCard from "./ExpertCard";

const Experts = () => {
  return (
    <section className="py-20">
      <div className="px-8 mx-auto max-w-7xl">
        <div className="flex flex-col justify-between w-full gap-6 lg:gap-0 lg:items-end lg:flex-row">
          <div className="">
            <p className="small-header">
              Curated network
            </p>
            <h2 className="text-5xl font-medium font-body!">
              The Expert Directory
            </h2>
          </div>
          <Link
            href={"/experts"}
            className="pb-1 text-sm transition-colors border-b w-fit border-b-primary-lighter/20 hover:border-b-primary-lighter"
          >
            View all experts
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-2 lg:grid-cols-3">
          <ExpertCard />
          <ExpertCard />
          <ExpertCard />
        </div>
      </div>
    </section>
  );
};

export default Experts;
