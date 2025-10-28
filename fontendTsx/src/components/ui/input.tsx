import React, { useState } from "react";
import { useFormContext, type UseFormRegister, type FieldValues } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

type InputProps<T extends FieldValues = FieldValues> = React.InputHTMLAttributes<HTMLInputElement> & {
  name?: string;
  register?: UseFormRegister<T>; // Optional register function
};

export default function Input<T extends FieldValues = FieldValues>({
  name,
  type = "text",
  register,
  ...rest
}: InputProps<T>) {
  const formContext = useFormContext<T>();
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  // Decide whether to use register from props or from context
  const registerProps = register
    ? register(name)
    : formContext
    ? formContext.register(name)
    : {};

  return (
    <div className="flex border-[1px] rounded-[4px] items-center">
      <input
        {...registerProps}
        {...rest}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        className="w-full focus:outline-0 px-2 py-[4px]"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-gray-500 pr-3 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}
