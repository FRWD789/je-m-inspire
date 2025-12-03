// src/components/ui/input.tsx - VERSION RÉTROCOMPATIBLE ✅
import React, { useState } from "react";
import { useFormContext, type UseFormRegister, type FieldValues } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

type InputProps<T extends FieldValues = FieldValues> = React.InputHTMLAttributes<HTMLInputElement> & {
  name?: string;
  register?: UseFormRegister<T>;
  variant?: 'default' | 'enhanced'; // Permet de choisir le style
};

export default function Input<T extends FieldValues = FieldValues>({
  name,
  type = "text",
  register,
  className,
  variant = 'enhanced', // Par défaut utilise le nouveau style
  ...rest
}: InputProps<T>) {
  const formContext = useFormContext<T>();
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const registerProps = register
    ? register(name)
    : formContext
    ? formContext.register(name)
    : {};

  // ✅ STYLE CONDITIONNEL - Compatible avec l'ancien ET le nouveau
  const inputClasses = clsx(
    "w-full focus:outline-0",
    // Nouveau style (enhanced) - Plus moderne
    variant === 'enhanced' && [
      "px-4 py-3",
      "border-2 border-secondary/30 rounded-lg",
      "bg-white text-primary",
      "placeholder:text-secondary/50",
      "transition-all duration-200",
      "hover:border-secondary/50",
      "focus:border-accent focus:ring-4 focus:ring-accent/10",
      "disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60",
    ],
    // Ancien style (default) - Rétrocompatible
    variant === 'default' && "px-2 py-[4px]",
    className
  );

  const wrapperClasses = clsx(
    variant === 'enhanced' && "relative w-full",
    variant === 'default' && "flex border-[1px] rounded-[4px] items-center"
  );

  return (
    <div className={wrapperClasses}>
      <input
        {...registerProps}
        {...rest}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        className={inputClasses}
      />
      
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={clsx(
            "transition-colors",
            variant === 'enhanced' 
              ? "absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-accent p-1"
              : "text-gray-500 pr-3 hover:text-gray-700"
          )}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff size={variant === 'enhanced' ? 20 : 18} />
          ) : (
            <Eye size={variant === 'enhanced' ? 20 : 18} />
          )}
        </button>
      )}
    </div>
  );
}