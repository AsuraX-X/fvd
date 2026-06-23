import ApplyBtn from "./ApplyBtn";

const Hero = () => {
  return (
    <section className="dark:bg-[url(/home/hero.png)]  flex items-end sm:py-30 py-16 bg-[url(/home/hero-light.png)] bg-no-repeat bg-cover h-screen w-full bg-center">
      <div className="w-full px-8 mx-auto space-y-6 max-w-7xl">
        <h1 className="max-w-4xl text-6xl italic font-bold sm:text-8xl ">
          We incite thought provoking campaigns.
        </h1>
        <p className="max-w-3xl">
          A creative studio reel unfolding frame by frame — activating brand
          value through sensory experiences that linger long after the first
          impression.
        </p>
        <div className="flex gap-4 w-fit lg:gap-6">
          <button className="button-primary shrink-0">Hire an expert</button>
          <ApplyBtn content="Apply as an expert" variant="secondary" width={180} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
