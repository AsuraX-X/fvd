import ExpertCard from "@/components/admin/experts/ExpertCard";

const page = () => {
  return (
    <div>
      <div>
        <input
          type="text"
          name="query"
          id="query"
          placeholder="Search by name, skill..."
          className="border text-sm border-primary-lighter/50 px-4 w-80 py-2 rounded-full focus:border-primary-lighter transition-colors focus:outline-0"
        />
      </div>
      <div>
        <ExpertCard
          name="Priya Raman"
          bio="Independent web designer + developer crafting editorial portfolios and product sites. Awwwards SOTD x3."
          email="priya@example.com"
          id=""
          specialty="Web Design"
        />
      </div>
    </div>
  );
};

export default page;
