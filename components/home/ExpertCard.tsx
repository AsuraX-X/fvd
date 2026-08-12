import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ExpertCardProps {
  id: string;
  name: string;
  headline: string | null;
  avatar: string | null;
  projectImage: string | null;
}

const ExpertCard = ({
  id,
  name,
  headline,
  avatar,
  projectImage,
}: ExpertCardProps) => {
  return (
    <Link
      href={`/experts/${id}`}
      className="w-full block cursor-pointer bg-primary-light space-y-4 p-4 rounded-2xl"
    >
      <div className="relative w-full aspect-video overflow-hidden bg-gray-600 rounded-xl">
        <Image
          src={projectImage || "https://placehold.co/160x90"}
          alt={`${name} project`}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative overflow-hidden rounded-full bg-gray-300 shrink-0 size-12">
            <Image
              src={avatar || "https://placehold.co/48x48"}
              alt={`${name} photo`}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-sm">{name}</h4>
            {headline && <p className="text-body text-xs">{headline}</p>}
          </div>
        </div>
        <div className="bg-secondary/10 py-1 px-1.5 rounded-md">
          <p className="flex gap-1 text-xs text-body items-center">
            <Star size={10} fill="#a1a9b4" stroke="#a1a9b4" />
            4.8
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ExpertCard;
