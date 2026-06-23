import ExpertGrid from "@/components/experts/ExpertGrid";
import ApplyBtn from "@/components/home/ApplyBtn";

const page = () => {
  return (
    <main className="py-50 px-8  max-w-7xl mx-auto">
      <section>
        <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-end">
          <div>
            <p className="small-header">Experts Directory</p>
            <h1 className="italic text-5xl md:text-6xl lg:text-7xl max-w-[20ch]">
              Curated talent, ready to bring your brand to life.
            </h1>
          </div>
          <div>
            <ApplyBtn content="Apply to join" width={137} />
          </div>
        </div>
        <div className="flex lg:justify-end py-8">
          <input
            type="text"
            name="query"
            id="query"
            placeholder="Search by name, skill..."
            className="border text-sm border-primary-lighter/50 px-4 w-80 py-2 rounded-full focus:border-primary-lighter transition-colors focus:outline-0"
          />
        </div>
      </section>
      <ExpertGrid />
    </main>
  );
};

export default page;
