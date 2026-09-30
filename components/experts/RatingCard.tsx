"use client";
import { Star } from "lucide-react";
import { motion } from "motion/react";

type RatingCardProps = {
  average: number;
  count: number;
  // counts[rating] = number of reviews with that rating (1–5)
  counts: Record<number, number>;
};

const RatingCard = ({ average, count, counts }: RatingCardProps) => {
  const rounded = Math.round(average);

  return (
    <div className="flex items-center rounded-xl divide-x divide-secondary/10 p-4 bg-primary-light">
      <div className="flex pr-4 flex-col items-center gap-2">
        <p className="text-4xl font-serif!">
          {count > 0 ? average.toFixed(1) : "–"}
        </p>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((value) =>
            value <= rounded ? (
              <Star key={value} size={16} fill="#ffd230" stroke="#ffd230" />
            ) : (
              <Star key={value} size={16} fill="#99a1af" stroke="#99a1af" />
            ),
          )}
        </div>
        <p className="text-sm text-body">
          {count} review{count === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex-1 pl-4">
        {[5, 4, 3, 2, 1].map((value) => {
          const n = counts[value] ?? 0;
          return (
            <div key={value} className="flex gap-1 items-center">
              <div className="text-body w-5 flex items-center justify-between">
                <p className="text-xs">{value}</p>
                <Star fill="#99a1af" size={10} />
              </div>
              <div className="flex-1 bg-secondary/10 rounded-full overflow-hidden shrink-0">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{
                    width: `${count > 0 ? (n / count) * 100 : 0}%`,
                  }}
                  viewport={{ once: true }}
                  transition={{ delay: value / 10 }}
                  className="h-1 bg-[#ffd230] rounded-full"
                />
              </div>
              <div>
                <p className="text-xs text-body w-5.5">{n}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingCard;
