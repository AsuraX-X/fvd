import { Star } from "lucide-react";
import Image from "next/image";

const ExpertCard = () => {
  return (
    <div className="min-w-full border-primary-light border hover:border-secondary-lighter/50 transition-colors cursor-pointer  bg-primary-light p-4 rounded-3xl">
      <div className="relative overflow-hidden rounded-2xl w-full transition-all aspect-video">
        <div className="absolute flex items-center justify-between w-full py-2 z-1 px-3">
          <span className="bg-primary/50 backdrop-blur-2xl py-1 px-2 rounded-full text-[11px] uppercase font-bold">
            Brand Direction
          </span>
          <button className="bg-primary/50 p-1.5 backdrop-blur-2xl rounded-full">
            <Star size={16} />
          </button>
        </div>
        <Image
          src="https://placehold.co/160x90"
          className="hover:scale-105 transition-all"
          alt="expert photo"
          fill
        />
      </div>
      <div className="flex py-4 items-center justify-between gap-2">
        <div>
          <h4 className="font-bold">Mira Linad</h4>
          <p className="text-xs font-body line-clamp-2">
            Independent creative director with 12 years building identity
            systems for technology and lifestyle brands. Previously at Pentagram
            and Wolff Olins.
          </p>
        </div>
        <div>
          <p className="text-xs text-nowrap">from ¢4.5k</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="w-full button-primary">Message</button>
        <button className="button-secondary w-full">View profile</button>
      </div>
    </div>
  );
};

export default ExpertCard;
