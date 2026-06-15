import Link from "next/link";
import ExpertCard from "./ExpertCard";

const Experts = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex w-full justify-between items-end">
          <div className="">
            <p className="uppercase mb-6 text-sm text-body/90 tracking-widest">
              Curated network
            </p>
            <h2 className="text-5xl font-medium font-body!">
              The Expert Directory
            </h2>
          </div>
          <Link
            href={"/experts"}
            className="border-b pb-1 border-b-primary-lighter/20 hover:border-b-primary-lighter transition-colors text-sm"
          >
            View all experts
          </Link>
        </div>
        <div className="grid gap-8 py-10 grid-cols-3">
          <ExpertCard />
          <ExpertCard />
          <ExpertCard />
        </div>
      </div>
    </section>
  );
};

export default Experts;
