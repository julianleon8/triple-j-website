import type { ComponentProps } from "react";

type Props = ComponentProps<"div"> & {
  size?: "narrow" | "default" | "wide";
};

const sizes = {
  narrow: "max-w-4xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

/**
 * Width-constrained wrapper used site-wide.
 * Padded for mobile, centered with a max-width on larger screens.
 */
export function Container({
  size = "default",
  className = "",
  ...props
}: Props) {
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
