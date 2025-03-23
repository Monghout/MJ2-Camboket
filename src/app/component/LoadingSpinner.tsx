import { cn } from "@/lib/utils";

interface LoadingSpinner {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white" | "black";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  color = "primary",
  className,
}: LoadingSpinner) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  const colorClasses = {
    primary: "border-primary/30 border-t-primary",
    secondary: "border-secondary/30 border-t-secondary",
    white: "border-white/30 border-t-white",
    black: "border-black/30 border-t-black",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
