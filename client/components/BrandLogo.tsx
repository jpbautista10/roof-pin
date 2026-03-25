import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const WORDMARK_SRC = "/roof-wise-pro-logo.png";
const ICON_SRC = "/roof-wise-pro-icon.png";

type BrandLogoProps = {
  to?: string;
  className?: string;
  /** max height of the logo image */
  size?: "sm" | "md" | "lg";
  /** use square icon (same as favicon) on dark backgrounds — reads cleaner than wordmark */
  onDarkBackground?: boolean;
};

const wordmarkHeights: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  sm: "h-6 sm:h-7",
  md: "h-8 sm:h-9",
  lg: "h-10 sm:h-12",
};

/** square icon sizes for dark footers */
const iconSizes: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function BrandLogo({
  to = "/",
  className,
  size = "md",
  onDarkBackground,
}: BrandLogoProps) {
  const img = onDarkBackground ? (
    <img
      src={ICON_SRC}
      alt="Roof Wise Pro"
      className={cn(
        "shrink-0 rounded-lg object-contain shadow-sm ring-1 ring-white/10",
        iconSizes[size],
      )}
    />
  ) : (
    <img
      src={WORDMARK_SRC}
      alt="Roof Wise Pro"
      className={cn(
        "w-auto max-w-[min(100%,240px)] object-contain object-left",
        wordmarkHeights[size],
      )}
    />
  );

  const inner = img;

  if (to) {
    return (
      <Link
        to={to}
        className={cn("inline-flex items-center shrink-0", className)}
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className={cn("inline-flex items-center", className)}>{inner}</div>
  );
}
