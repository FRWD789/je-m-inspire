import  { useEffect, type ReactNode } from "react";
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



  
  const methods = useForm<TypeOf<T>>({
    resolver: zodResolver(schema)as any,
    defaultValues,

  });

  useEffect(() => {
    if (defaultValues) {
      methods.reset(defaultValues);
    }
  }, [defaultValues]);
 

  const handleFormSubmit: SubmitHandler<TypeOf<T>> = (data) => {
    if (onSubmit) {
      onSubmit(data);
      if (!defaultValues) {
        methods.reset();
      }

    } 
  
  };

  console.log(methods.formState.errors)

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)}  className="grid  gap-y-3">{children}</form>
    </FormProvider>
  );
}
