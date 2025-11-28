import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
  loadingText?: string;
};

export default function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
  isLoading = false,
  loadingText = "Loading...",
  ...rest
}: ButtonProps) {
  const baseStyles =
    "w-full rounded-[4px] font-medium px-4 py-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 flex items-center justify-center gap-2";

  const variants = {
    primary: "px-4 py-2 bg-accent text-white rounded hover:bg-primary transition-colors focus:ring-blue-500",
    secondary:
      "px-4 py-2 bg-accent text-white rounded hover:bg-primary transition-colors focus:ring-gray-400",
    outline:
      "px-4 py-2 bg-accent text-white rounded hover:bg-primary transition-colors focus:ring-gray-400",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={clsx(
        baseStyles,
        variants[variant],
        (disabled || isLoading) && "opacity-60 cursor-not-allowed",
        className
      )}
      {...rest}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      <span>{isLoading ? loadingText : children}</span>
    </button>
  );
}