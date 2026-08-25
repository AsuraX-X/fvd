import { ArrowUpRight } from "lucide-react";

const ApplicationEntry = () => {
  return (
    <div className="text-sm space-y-4 bg-primary-light p-6 rounded-2xl">
      <div>
        <div className="flex justify-between">
          <h2 className="font-body! font-bold ">Lina Fernandes</h2>
          <div>Pending</div>
        </div>
        <p className="text-xs text-body">
          lina.fernandes@example.com · Experiential Production
        </p>
      </div>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Veritatis
        mollitia rerum beatae ex tempore expedita qui esse saepe maxime.
        Voluptates odio nobis illum nihil blanditiis laudantium voluptas quae
        amet modi! Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Accusantium officiis, molestias ullam vitae consequatur laudantium ab
        natus a quam, eligendi nihil. Labore saepe similique nam vero suscipit,
        facere optio velit!
      </p>
      <div className="flex gap-2">
        <p className="text-body hover:text-secondary transition-colors text-xs flex items-center gap-1">
          Website <ArrowUpRight size={16} />
        </p>
        <p className="text-body hover:text-secondary transition-colors text-xs flex items-center gap-1">
          Portfolio
          <ArrowUpRight size={16} />
        </p>
      </div>
      <div className="">
        <button className="button-primary bg-[#04ae79] border-[#04ae79] hover:opacity-90 hover:bg-[#04ae79] hover:border-[#04ae79]">
          Approve
        </button>
        <button className="button-secondary">Reject</button>
      </div>
    </div>
  );
};

export default ApplicationEntry;
