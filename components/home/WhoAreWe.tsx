"use client";
import { useDarkMode } from "@/hooks/useColorScheme";
import Image from "next/image";

const WhoAreWe = () => {
  const isDark = useDarkMode();

  return (
    <section className="py-20 bg-primary-light">
      <div className="max-w-7xl flex justify-between w-full mx-auto">
        <div className="space-y-8">
          <div className="pb-12 border-b border-primary-lighter/10">
            <p className="uppercase mb-6 text-sm text-body/90 tracking-widest">
              Who are we
            </p>
            <h2 className="mb-12 text-5xl font-medium font-body!">
              A behavior, not just a studio.
            </h2>
            <div className="space-y-8 max-w-[58ch] leading-7 text-body">
              <p>
                We are a unique blend of talent with diverse cultures and
                beliefs. Each mind is unique with the power to identify triggers
                which propel brands to sustainable leadership positions.
              </p>
              <p>
                We share ideas, develop insights, tell stories, capture
                memories, and trigger conversations. We are more than creative
                minds. We bring brands to life.
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="w-full">
              <h3 className="mb-3 font-medium text-sm font-body!">
                Strategic Core
              </h3>
              <ul className="text-sm list-disc list-inside text-body space-y-2">
                <li>Develop brand persona</li>
                <li>Create memorable stories</li>
                <li>Distinct & Unique</li>
              </ul>
            </div>
            <div className="w-full">
              <h3 className="mb-3 font-medium text-sm font-body!">
                Creative Art
              </h3>
              <ul className="text-sm list-disc list-inside text-body space-y-2">
                <li>Visual Identity</li>
                <li>CGI Animation</li>
                <li>Motion Graphics</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="w-100 shrink-0">
          <Image
            src={
              isDark ? "/home/sculpture-dark.png" : "/home/sculpture-white.png"
            }
            width={640}
            height={960}
            alt="sculpture"
            className="rounded-2xl border border-primary-lighter/10"
          />
        </div>
      </div>
    </section>
  );
};

export default WhoAreWe;
