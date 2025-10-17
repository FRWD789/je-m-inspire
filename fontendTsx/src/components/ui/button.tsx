import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
};

export default function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
  ...rest
}: ButtonProps) {
  const baseStyles =
    "w-full rounded-[4px] font-medium px-4 py-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1";

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
      disabled={disabled}
      className={clsx(
        baseStyles,
        variants[variant],
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
