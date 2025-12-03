// src/components/ui/select.tsx - VERSION RÉTROCOMPATIBLE ✅
import { useFormContext, type FieldValues, type UseFormRegister } from "react-hook-form";
import clsx from "clsx";

type SelectProps<T extends FieldValues = FieldValues> = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "name"
> & {
  name?: string;
  options: Option[];
  placeholder?: string;
  register?: UseFormRegister<T>;
  variant?: 'default' | 'enhanced'; // Permet de choisir le style
};

export default function Select<T extends FieldValues = FieldValues>({
  name,
  options,
  placeholder,
  register,
  className,
  variant = 'enhanced', // Par défaut utilise le nouveau style
  ...rest
}: SelectProps<T>) {
  const formContext = useFormContext<T>();
  const registerProps = register ? register(name) : formContext ? formContext.register(name) : {};

  // ✅ STYLE CONDITIONNEL
  const selectClasses = clsx(
    "w-full focus:outline-0",
    // Nouveau style (enhanced)
    variant === 'enhanced' && [
      "px-4 py-3 pr-10", // pr-10 pour l'icône
      "border-2 border-secondary/30 rounded-lg",
      "bg-white text-primary",
      "transition-all duration-200",
      "hover:border-secondary/50",
      "focus:border-accent focus:ring-4 focus:ring-accent/10",
      "disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60",
      "cursor-pointer appearance-none",
    ],
    // Ancien style (default)
    variant === 'default' && "px-2 py-[4px]",
    className
  );

  const wrapperClasses = clsx(
    variant === 'enhanced' && "relative w-full",
    variant === 'default' && "flex border-[1px] rounded-[4px] items-center"
  );

  return (
    <div className={wrapperClasses}>
      {/* Icône flèche personnalisée (uniquement en enhanced) */}
      {variant === 'enhanced' && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-accent">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      )}

      <select {...registerProps} {...rest} className={selectClasses}>
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.description}
          </option>
        ))}
      </select>
    </div>
  );
}