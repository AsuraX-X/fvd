import ReviewCard from "./ReviewCard";

type ReviewsProps = {
  reviews: {
    id: string;
    name: string;
    avatar: string | null;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
};

const Reviews = ({ reviews }: ReviewsProps) => {
  if (reviews.length === 0) {
    return <p className="text-sm text-body">No reviews yet.</p>;
  }

  return (
    <div className="divide-y divide-primary-light">
      {reviews.map(({ id, ...review }) => (
        <ReviewCard key={id} {...review} />
      ))}
    </div>
  );
};

export default Reviews;
