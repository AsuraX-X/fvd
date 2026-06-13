import ApplyBtn from "./ApplyBtn";

const Hero = () => {
  return (
    <section className="dark:bg-[url(/home/hero.png)]  flex items-end sm:py-30 py-16 bg-[url(/home/hero-light.png)] bg-no-repeat bg-cover h-screen w-full bg-center">
      <div className="max-w-7xl w-full space-y-6 mx-auto">
        <h1 className="italic max-w-4xl font-bold text-5xl sm:text-8xl ">
          We incite thought provoking campaigns.
        </h1>
        <p className="max-w-3xl">
          A creative studio reel unfolding frame by frame — activating brand
          value through sensory experiences that linger long after the first
          impression.
        </p>
        <div className="flex gap-6">
          <button className="button-primary">Hire an expert</button>
          <ApplyBtn/>
        </div>
      </div>
    </section>
  );
};

export default Hero;
