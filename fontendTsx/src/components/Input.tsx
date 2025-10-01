import React, { useState } from 'react'
import type {  FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'

import Icon from "../assets/eye.svg?react";
import IconAlt from "../assets/eye-alt.svg?react";
import { cn } from '@/lib/utils';

type InputFieldProps<T extends FieldValues> = {
  
  name: Path<T>;                 // must be a key from form schema
  register: UseFormRegister<T>;
  errors: FieldErrors|undefined;
}&React.ComponentProps<"input">;

function Input<T extends FieldValues>({type,required,name,errors,register,className,...props}:InputFieldProps<T>) {
    const [show,setShow] = useState(false)
      const errorMessage = errors?.[name]?.message as string | undefined;
      const handelClick = ()=>{
        setShow(!show)
      }
  return (  

 
         <div className={cn(`w-full flex border-[1px]  items-center justify-between rounded-[2px] px-[8px] py-[6px] ${errorMessage?"border-red-400 ":""}`,className)}>
                <input className={`w-full focus:outline-0 `}  type={type === "password" ? (show ? "text" : "password") : type} {...props} {...register(name,{required})} />
                {type === "password" && (
                    show ? <IconAlt onClick={handelClick} /> : <Icon onClick={handelClick} />
                    )}
                    
         </div>
  )
}

export default Input