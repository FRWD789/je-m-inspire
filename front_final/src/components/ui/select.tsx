import React from "react";
import { useFormContext } from "react-hook-form";

export type Option = {
  description: string;
  value: string;
};

type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "name"
> & {
  name: string;
  options: Option[];
};

export default function Select({ name, options, ...rest }: SelectProps) {
  const { register } = useFormContext();

  return (
    <div className="flex border-[1px] items-center">
      <select
        {...register(name)}
        {...rest}
        className="w-full rounded-[4px] focus:outline-0 px-2 py-[4px]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.description}
          </option>
        ))}
      </select>
    </div>
  );
}
