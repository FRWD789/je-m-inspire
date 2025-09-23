import React from 'react'
import type {  FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'


type InputFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;                 // must be a key from form schema
  register: UseFormRegister<T>;
  errors?: FieldErrors<T>;
  required?: boolean;
  type?: string;
};


function Input<T extends FieldValues>({label,name,required,register}:InputFieldProps<T>) {
  return (
    <div className='grid gap-y-1'>
        <label>
            {label}
        </label>
        <input className='outline-1 w-full ' type="text" {...register(name,{required})} />
        
    </div>

  )
}

export default Input