import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

/**
 * CSS-only spinning loader.
 * Control size with Tailwind h-* / w-* classes.
 * Control color with text-* classes (uses currentColor for the border).
 */
export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "inline-block animate-spin rounded-full border-[3px] border-current border-t-transparent",
        className
      )}
    />
  );
}
