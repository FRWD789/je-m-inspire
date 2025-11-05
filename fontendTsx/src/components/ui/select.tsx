import { useFormContext, type FieldValues, type UseFormRegister } from "react-hook-form";

type SelectProps<T extends FieldValues = FieldValues> = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "name"
> & {
  name?: string;
  options: Option[];
  placeholder?: string; // Add placeholder
  register?: UseFormRegister<T>;
};

export default function Select<T extends FieldValues = FieldValues>({
  name,
  options,
  placeholder,
  register,
  ...rest
}: SelectProps<T>) {
  const formContext = useFormContext<T>();
  const registerProps = register ? register(name) : formContext ? formContext.register(name) : {};

  return (
    <div className="flex border-[1px] rounded-[4px] items-center">
      <select {...registerProps} {...rest} className="w-full focus:outline-0 px-2 py-[4px]">
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
