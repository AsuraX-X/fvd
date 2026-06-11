import ApplyBtn from "./ApplyBtn";

const Hero = () => {
  return (
    <section className="dark:bg-[url(/home/hero.png)] bg-[url(/home/hero-light.png)] bg-no-repeat bg-cover h-screen w-full bg-center">
      <div className="absolute max-w-4xl space-y-6 bottom-20 left-40">
        <h1 className="italic font-bold text-8xl ">
          We incite thought provoking campaigns.
        </h1>
        <p>
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
