import AvatarImage from "@/components/common/AvatarImage";
import Link from "next/link";
import SaveExpertButton from "./SaveExpertButton";

interface ExpertCard {
  id: string;
  specialty: string | null;
  profileImage: string | null;
  name: string;
  bio: string | null;
  rate: number | null;
  isSaved: boolean;
}

const ExpertCard = ({
  id,
  specialty,
  profileImage,
  name,
  bio,
  rate,
  isSaved,
}: ExpertCard) => {
  return (
    <div className="min-w-full group border-primary-light border hover:border-secondary-lighter/50 transition-colors duration-500 cursor-pointer  bg-primary-light p-4 rounded-3xl">
      <div className="relative overflow-hidden rounded-2xl w-full transition-all aspect-video bg-secondary/10">
        <div className="absolute flex items-center justify-between w-full py-2 z-1 px-3">
          {specialty && (
            <span className="bg-primary/50 backdrop-blur-2xl py-1 px-2 rounded-full text-[11px] uppercase font-bold">
              {specialty}
            </span>
          )}
          <SaveExpertButton
            expertId={id}
            initialSaved={isSaved}
            className="bg-primary/50 p-1.5 backdrop-blur-2xl rounded-full ml-auto"
          />
        </div>
        {profileImage && (
          <AvatarImage
            key={profileImage}
            src={profileImage}
            alt={`${name} photo`}
            className="absolute inset-0 ease-in-out duration-500 h-full w-full object-cover group-hover:scale-105 transition-all"
            fallback={null}
          />
        )}
      </div>
      <div className="flex py-4 items-center justify-between gap-2">
        <div>
          <h4 className="font-bold">{name}</h4>
          {bio && <p className="text-xs font-body line-clamp-2">{bio}</p>}
        </div>
        <div>
          <p className="text-xs text-nowrap">
            {rate ? `from ¢${rate.toLocaleString()}` : "Rate on request"}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link
          href={`/messages/${id}`}
          className="w-full text-xs text-center font-bold button-primary"
        >
          Message
        </Link>
        <Link
          href={`/experts/${id}`}
          className="button-secondary text-xs font-bold w-full text-center"
        >
          View profile
        </Link>
      </div>
    </div>
  );
};

export default ExpertCard;
