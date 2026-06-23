import ExpertCard from "./ExpertCard";

const ExpertGrid = () => {
  return (
    <section className="grid lg:grid-cols-3 gap-8 py-20 border-y border-y-secondary/10 place-items-center md:grid-cols-2 grid-cols-1">
      <ExpertCard />
      <ExpertCard />
      <ExpertCard />
      <ExpertCard />
      <ExpertCard />
      <ExpertCard />
    </section>
  );
};

export default ExpertGrid;
