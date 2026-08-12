import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import RemoveSavedExpertButton from "./RemoveSavedExpertButton";

interface ExpertCardProps {
  id: string;
  name: string;
  headline: string | null;
  avatar: string | null;
}

const ExpertCard = ({ id, name, headline, avatar }: ExpertCardProps) => {
  return (
    <div className="text-xs space-y-2 bg-primary-light rounded-2xl p-4">
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
          <p className="font-bold">{name}</p>
          {headline && <p className="text-body">{headline}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Link
          href={`/experts/${id}`}
          className="flex border-b border-b-primary-light hover:border-b-secondary transition-colors items-center gap-1"
        >
          View Profile <ArrowRight size={14} />
        </Link>
        <RemoveSavedExpertButton expertId={id} />
      </div>
    </div>
  );
};

export default ExpertCard;
