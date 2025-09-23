import React, { useState } from 'react'
import type {  FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'

import Icon from "../assets/eye.svg?react";
import IconAlt from "../assets/eye-alt.svg?react";

type InputFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;                 // must be a key from form schema
  register: UseFormRegister<T>;
  errors?: FieldErrors<T>;
  required?: boolean;
  type?: string;
};

function InputWithLabel<T extends FieldValues>({label,type,required,name,errors,register}:InputFieldProps<T>) {
    const [show,setShow] = useState(false)
      const errorMessage = errors?.[name]?.message as string | undefined;
      const handelClick = ()=>{
        setShow(!show)
      }
  return (
    <div className={`grid gap-y-1 ${errorMessage?"text-red-400 ":""}`}>
        <label>
            {label}
        </label>
        <div className='grid gap-y-[2px]'>
            
         <div className={`w-full flex border-[1px]  items-center justify-between rounded-[2px] px-[8px] py-[6px] ${errorMessage?"border-red-400 ":""}`}>
                <input className={`w-full focus:outline-0 `}  type={type === "password" ? (show ? "text" : "password") : type} {...register(name,{required})} />
                {type === "password" && (
                    show ? <IconAlt onClick={handelClick} /> : <Icon onClick={handelClick} />
                    )}
              
         </div>
            
            {errorMessage&&(
                <span className='text-red-400'>{errorMessage}</span>
            )}
        </div>
        
        
    </div>
  )
}

export default InputWithLabel