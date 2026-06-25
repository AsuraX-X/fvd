import { prods, strats } from "@/constants";

const ServicesContent = () => {
  return (
    <>
      <section className="border-b lg:pb-26 md:pb-20 pb-16 border-b-secondary-lighter/10">
        <div className="px-8 max-w-7xl mx-auto  ">
          <p className="small-header">Services</p>
          <h1 className="lg:text-7xl md:text-6xl text-5xl italic max-w-[15ch]">
            The full cycle of brand building.
          </h1>
        </div>
      </section>
      <section className="px-8 max-w-7xl mx-auto lg:py-24 md:py-20 py-16 gap-12 grid grid-cols-1 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="font-serif! text-3xl italic text-body/50">01</p>
          <h2 className="lg:text-5xl text-4xl font-body!">
            Strategy & Creative
          </h2>
          <p className="text-sm text-body">
            We develop mind blowing prepositions that drive brand value whilst
            ensuring consistency in sustaining a leadership position. We nurture
            brands through relentless creative and content execution.
          </p>
          <p className="text-body/80 font-serif! italic">
            Evoke Brand Power. Our creative powerhouse is strictly guided by
            insights and carefully crafted strategies.
          </p>
        </div>
        <ul className="divide-y divide-secondary-lighter/10 lg:my-0 my-24 border-secondary-lighter/10 border-y">
          {strats.map((strat, i) => (
            <li
              className="flex items-center py-6 gap-4 justify-between"
              key={i}
            >
              <p className="text-2xl">{strat}</p>
              <p className="font-mono! text-sm text-body/50">0{i + 1}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="bg-primary-light">
        <div className="px-8 max-w-7xl mx-auto lg:pb-48 md:pb-30 pb-20  lg:py-24 md:py-20 py-16  gap-12 grid grid-cols-1 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="font-serif! text-3xl italic text-body/50">02</p>
            <h2 className="lg:text-5xl text-4xl font-body!">
              Production & Lifecycle
            </h2>
            <p className="text-sm text-body">
              We are intentional about what we create. We are intentional about
              how it is produced. We are intentional about deliverables and
              Value-for-money.
            </p>
            <p className="text-body/80 font-serif! italic">
              It is just right that we complete the full cycle of brand building
              whilst nurturing product growth.
            </p>
          </div>
          <ul className="divide-y divide-secondary-lighter/10 lg:my-0 my-24 border-secondary-lighter/10 border-y">
            {prods.map((prod, i) => (
              <li
                className="flex items-center py-6 gap-4 justify-between"
                key={i}
              >
                <p className="text-2xl">{prod}</p>
                <p className="font-mono! text-sm text-body/50">0{i + 1}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default ServicesContent;
