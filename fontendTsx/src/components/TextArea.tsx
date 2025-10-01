import React, { useState } from 'react'
import type {  FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { cn } from '@/lib/utils';

type InputFieldProps<T extends FieldValues> = {
  name: Path<T>;                 // must be a key from form schema
  register: UseFormRegister<T>;
  errors: FieldErrors|undefined;
}&React.ComponentProps<"textarea">;

function Textarea<T extends FieldValues>({required,name,errors,register,className,...props}:InputFieldProps<T>) {

      const errorMessage = errors?.[name]?.message as string | undefined;
   
  return (  

 
        <textarea className={cn(`w-full flex border-[1px] focus:outline-0  items-center justify-between rounded-[2px] px-[8px] py-[6px] ${errorMessage?"border-red-400 ":""}`,className)}{...props} {...register(name,{required})} />

  )
}

export default Textarea