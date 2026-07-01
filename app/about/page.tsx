"use client";
import { useDarkMode } from "@/hooks/useColorScheme";
import Image from "next/image";

const About = () => {
  const isDark = useDarkMode();

  const whos = [
    "Develop brand persona",
    "Create memorable stories",
    "Distinct & Unique",
    "Make you experience the best",
    "Create Art",
  ];

  const whys = [
    {
      heading: "Intentional and careful",
      text: "A unique blend of talent with diverse cultures and beliefs. Each mind identifies the triggers that propel brands to sustainable leadership positions.",
    },
    {
      heading: "We are humans",
      text: "Excellence is our hallmark. We combine our energies to bring mind-blowing ideas to power any brand into a sustainable leadership position.",
    },
    {
      heading: "A behaviour, and the best",
      text: "We respect everyone. We share ideas, develop insights, tell stories, capture memories, and incite positive action. We make brands a household name.",
    },
    {
      heading: "Fun, loving, entertaining",
      text: "Be yourself — we are here for you and all yours. We love to share in our space with all your stories. And we just love to listen.",
    },
  ];

  return (
    <main className="py-50 space-y-30 max-w-7xl px-8 mx-auto">
      <section>
        <p className="small-header">Introduction</p>
        <h1 className="text-7xl italic mb-8">What we do.</h1>
        <p className="text-body max-w-[50ch] text-xl">
          Strategy & Creative. Production & Lifecycle. We incite
          thought-provoking campaigns that evoke the power of brand value — for
          partners who value precision over noise.
        </p>
      </section>
      <section className="flex justify-end">
        <div className="max-w-150">
          <div className="h-px w-full bg-linear-to-r from-transparent via-secondary/40 to-transparent mb-4" />
          <p className="small-header">Our Vision</p>
          <p className="font-serif!  text-4xl">
            “To spark unique sensory experiences. We are more than creative
            minds — we bring brands to life.”
          </p>
        </div>
      </section>
      <section className="flex items-center gap-20">
        <div className="hidden w-100 lg:block shrink-0">
          <Image
            src={
              isDark ? "/home/sculpture-dark.png" : "/home/sculpture-white.png"
            }
            width={640}
            height={960}
            alt="sculpture"
            className="border rounded-2xl border-primary-lighter/10"
          />
        </div>
        <div className="space-y-6">
          <p className="small-header">Who are we?</p>
          <h2 className="text-6xl italic">
            We love art and are relentless about creativity.
          </h2>
          <p className="text-body text-xl">
            Like-minded people with an understanding of how to induce life and
            value for brands. A distributed collective with the energy of three
            strategic departments in a box.{" "}
            <span className="text-foreground text-2xl italic font-serif!">
              “this is our secret.”
            </span>
          </p>
          <div>
            <ul className="grid grid-cols-2 list-disc text-body gap-2">
              {whos.map((who, i) => (
                <li key={i} className="text-sm">
                  {who}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section>
        <div className="flex mb-6 gap-4 items-center">
          <p className="small-header mb-0 text-nowrap">Why Fvdlance</p>
          <div className="h-px w-full bg-primary-light" />
        </div>
        <div className="border border-primary-light grid grid-cols-2 divide-x divide-y  divide-primary-light">
          {whys.map(({ heading, text }, i) => (
            <div key={i} className="p-12 hover:bg-primary-light transition-colors duration-500 ease-in-out">
              <h3 className="font-body! mb-4 font-bold text-2xl">{heading}</h3>
              <p className="text-body">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default About;
