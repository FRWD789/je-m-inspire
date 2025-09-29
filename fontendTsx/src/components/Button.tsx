import { Loader2 } from 'lucide-react';
import React from 'react'

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?:() => void
};
export default function Button({type="button",onClick,isLoading=false,disabled=false,children,className}:ButtonProps) {
  return (
     <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-[4px] px-[8px] py-[6px] bg-primary text-white font-medium hover:bg-blue-700 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition ${className}`}
    >
      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  )
}
