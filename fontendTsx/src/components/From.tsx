import React, { type ReactNode } from "react";
import { FormProvider, useForm, type DefaultValues, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ZodType, type TypeOf } from "zod";

type FormProps<T extends ZodType<any, any, any>> = {
  type?:'user'|'professional'
  schema: T;
  children: ReactNode;
  onSubmit?: (data: TypeOf<T>) => void;
  defaultValues?: DefaultValues<TypeOf<T>>
}

export default function Form<T extends ZodType<any, any, any>>({
  schema,
  children,
  onSubmit,
  defaultValues,

}: FormProps<T>) {

  console.log(defaultValues)
  const methods = useForm<TypeOf<T>>({
    resolver: zodResolver(schema)as any,
    defaultValues,

  });


  console.log(methods.formState.errors)

  const handleFormSubmit: SubmitHandler<TypeOf<T>> = (data) => {
    if (onSubmit) {
      onSubmit(data);
      methods.reset()
    } else {
      console.log(data);
    }

  
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)}  className="grid  gap-y-[12px]">{children}</form>
    </FormProvider>
  );
}
