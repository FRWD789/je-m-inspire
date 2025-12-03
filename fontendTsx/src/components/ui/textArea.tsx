// src/components/ui/textArea.tsx - VERSION RÉTROCOMPATIBLE ✅
import React from 'react'
import { useFormContext } from 'react-hook-form';
import clsx from 'clsx';

type TextAreaProps = Omit<
  React.SelectHTMLAttributes<HTMLTextAreaElement>,
  "name"
> & {
  name: string;
  variant?: 'default' | 'enhanced'; // Permet de choisir le style
  maxLength?: number;
  showCharCount?: boolean; // Optionnel: afficher compteur (uniquement en enhanced)
};

export default function TextArea({
  name,
  className,
  variant = 'enhanced', // Par défaut utilise le nouveau style
  maxLength,
  showCharCount = false,
  ...res
}: TextAreaProps) {
  const { register, watch } = useFormContext();
  const value = watch ? watch(name) : '';
  const charCount = value?.length || 0;

  // ✅ STYLE CONDITIONNEL
  const textAreaClasses = clsx(
    "w-full focus:outline-0",
    // Nouveau style (enhanced)
    variant === 'enhanced' && [
      "px-4 py-3",
      "border-2 border-secondary/30 rounded-lg",
      "bg-white text-primary",
      "placeholder:text-secondary/50",
      "transition-all duration-200",
      "hover:border-secondary/50",
      "focus:border-accent focus:ring-4 focus:ring-accent/10",
      "disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60",
      "resize-none min-h-[120px]",
    ],
    // Ancien style (default)
    variant === 'default' && [
      "border-[1px] px-2 py-[4px] rounded-[4px]",
    ],
    className
  );

  return (
    <div className="relative w-full">
      <textarea 
        {...register(name)} 
        {...res}
        className={textAreaClasses}
        maxLength={maxLength}
        rows={variant === 'default' ? 4 : undefined}
      />
      
      {/* Compteur de caractères (uniquement en mode enhanced) */}
      {variant === 'enhanced' && showCharCount && maxLength && (
        <div className="absolute bottom-2 right-3 text-xs text-secondary/70 bg-white/90 px-2 py-0.5 rounded pointer-events-none">
          {charCount}/{maxLength}
        </div>
      )}
    </div>
  )
}