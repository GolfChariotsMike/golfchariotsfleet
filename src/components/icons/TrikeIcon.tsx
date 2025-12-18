import { SVGProps } from "react";

interface TrikeIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function TrikeIcon({ size = 24, className, ...props }: TrikeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Front wheel */}
      <circle cx="18" cy="17" r="3" />
      {/* Back left wheel */}
      <circle cx="6" cy="17" r="3" />
      {/* Back right wheel (slightly behind) */}
      <circle cx="6" cy="11" r="2.5" />
      {/* Frame connecting wheels */}
      <path d="M9 17h6" />
      <path d="M15 17l3-8h-6l-3 8" />
      {/* Handlebar */}
      <path d="M12 9V6" />
      <path d="M10 6h4" />
      {/* Seat */}
      <path d="M8 14h2" />
    </svg>
  );
}
