"use client";
import { submitReview, type SubmitReviewState } from "@/app/experts/actions";
import { REVIEW_MAX_LENGTH } from "@/constants";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useActionState, useState } from "react";

const StarM = motion.create(Star);

type ReviewProps = {
  expertId: string;
  signedIn: boolean;
  initialRating?: number;
  initialComment?: string;
};

const initialState: SubmitReviewState = { success: false, message: "" };

const Review = ({
  expertId,
  signedIn,
  initialRating = 0,
  initialComment = "",
}: ReviewProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [state, formAction, pending] = useActionState(
    submitReview,
    initialState,
  );

  if (!signedIn) {
    return (
      <div className="flex rounded-xl flex-col gap-3 p-4 bg-primary-light">
        <p className="text-sm text-body">
          <Link href="/account?signin=true" className="link">
            Sign in
          </Link>{" "}
          to leave a review.
        </p>
      </div>
    );
  }

  const active = hover || rating;

  return (
    <form
      action={formAction}
      className="flex rounded-xl flex-col gap-3 p-4 bg-primary-light"
    >
      <input type="hidden" name="expertId" value={expertId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex">
        {[1, 2, 3, 4, 5].map((value) => (
          <motion.button
            key={value}
            type="button"
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            onHoverStart={() => setHover(value)}
            onHoverEnd={() => setHover(0)}
            onClick={() => setRating(value)}
          >
            <StarM
              size={18}
              animate={{
                fill: active >= value ? "#ffd230" : "#ffd23000",
                stroke: active >= value ? "#ffd230" : "#99a1af",
              }}
            />
          </motion.button>
        ))}
      </div>
      <div>
        <textarea
          name="comment"
          id="review"
          rows={4}
          required
          maxLength={REVIEW_MAX_LENGTH}
          defaultValue={initialComment}
          className="text-sm resize-none w-full border border-secondary/20 focus-visible:border-secondary transition-colors focus-visible:outline-none rounded-lg p-2"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || rating === 0}
          className="button-primary disabled:opacity-50"
        >
          {pending
            ? "Posting..."
            : initialRating
              ? "Update review"
              : "Post review"}
        </button>
        {state.message && (
          <p
            className={`text-xs ${state.success ? "text-body" : "text-red-500"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
};

export default Review;
