import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string;
};

export default function Input({ name, type = "text", ...rest }: InputProps) {
  const { register } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex border-[1px] rounded-[4px] items-center ">
      <input
        {...register(name)}
        {...rest}
        type={isPassword ? !showPassword ? "password" : "text":type }
        className="w-full  focus:outline-0 px-2 py-[4px]"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="  text-gray-500 pr-3 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}
