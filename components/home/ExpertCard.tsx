import { Star } from "lucide-react";
import Image from "next/image";

const ExpertCard = () => {
  return (
    <div className="w-full cursor-pointer bg-primary-light space-y-4 p-4 rounded-2xl">
      <div className="relative w-full aspect-video overflow-hidden bg-gray-600 rounded-xl">
        <Image
          src={"https://placehold.co/160x90"}
          className=""
          alt="expert"
          fill
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative rounded-full bg-gray-300 size-12">
            <Image src={""} alt="expert-picture" fill />
          </div>
          <div>
            <h4 className="text-sm">Sarah Jenkins</h4>
            <p className="text-body text-xs">Head CGI Director</p>
          </div>
        </div>
        <div className="bg-secondary/10 py-1 px-1.5 rounded-md">
          <p className="flex gap-1 text-xs text-body items-center">
            <Star size={10} fill="#a1a9b4" stroke="#a1a9b4" />
            4.8
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;
