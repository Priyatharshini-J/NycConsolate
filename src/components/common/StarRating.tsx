import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  interactive = false,
  onRatingChange,
  className 
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;
        
        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              isFilled 
                ? "fill-professional-warning text-professional-warning" 
                : "text-muted-foreground",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onClick={interactive ? () => onRatingChange?.(starNumber) : undefined}
          />
        );
      })}
    </div>
  );
}