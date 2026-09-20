import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
  showNumber?: boolean;
}

export function StarRating({ rating, size = 16, className, showNumber = false }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= Math.round(rating)
                ? 'fill-accent-400 text-accent-400'
                : 'fill-neutral-200 text-neutral-200'
            }
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-neutral-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
