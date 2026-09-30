import { Star } from "lucide-react";
import AvatarImage from "../common/AvatarImage";

type ReviewCardProps = {
  name: string;
  avatar: string | null;
  rating: number;
  comment: string;
  createdAt: Date;
};

const ReviewCard = ({
  name,
  avatar,
  rating,
  comment,
  createdAt,
}: ReviewCardProps) => {
  const fallback = (
    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-primary">
      {name[0]?.toUpperCase() ?? "U"}
    </span>
  );

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative my-auto w-10 shrink-0 self-start aspect-square rounded-full bg-secondary overflow-hidden">
            {avatar ? (
              <AvatarImage
                key={avatar}
                src={avatar}
                alt={`${name} photo`}
                className="absolute inset-0 h-full w-full object-cover"
                fallback={fallback}
              />
            ) : (
              fallback
            )}
          </div>
          <div>
            <p className="text-sm">{name}</p>
            <p className="text-xs text-body">
              {createdAt.toLocaleDateString("en-US")}
            </p>
          </div>
        </div>
        <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((value) =>
            value <= rating ? (
              <Star key={value} stroke="#ffd230" fill="#ffd230" size={12} />
            ) : (
              <Star key={value} stroke="#99a1af" fill="#99a1af" size={12} />
            ),
          )}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm whitespace-pre-line wrap-break-word">{comment}</p>
      </div>
    </div>
  );
};

export default ReviewCard;
