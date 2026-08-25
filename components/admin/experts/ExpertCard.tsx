import { ArrowRight } from "lucide-react";
import Link from "next/link";

const ExpertCard = ({
  name,
  email,
  specialty,
  bio,
  id,
}: {
  name: string;
  email: string;
  specialty: string;
  bio: string;
  id: string;
}) => {
  return (
    <div className="text-sm bg-primary-light p-4 rounded-2xl">
      <div>
        <p>{name}</p>
        <p className="text-body text-xs">
          {email} · {specialty}
        </p>
      </div>
      <div>
        <p>{bio}</p>
      </div>
      <div>
        <Link href={`/experts/${id}`}>
          <p className="flex text-xs gap-0.5 text-body items-center hover:text-secondary transition-colors">
            View profile <ArrowRight size={14} />
          </p>
        </Link>
      </div>
    </div>
  );
};

export default ExpertCard;
