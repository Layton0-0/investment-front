import React from "react";

/**
 * Investment Choi logo (Figma publish design).
 * Blue rounded rect with white chart line and green dot.
 */
export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="40" height="40" rx="10" fill="#3182F6" />
      <path
        d="M10 25L18 17L24 23L32 12"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="32"
        cy="12"
        r="3"
        fill="#00D47E"
        stroke="#3182F6"
        strokeWidth="2"
      />
    </svg>
  );
}
