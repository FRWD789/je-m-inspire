import React from 'react'
import { useFormContext } from 'react-hook-form';


type TextAreaProps = Omit<
  React.SelectHTMLAttributes<HTMLTextAreaElement>,
  "name"
> & {
  name: string;

};

export default function TextArea({name,...res}:TextAreaProps) {
      const { register } = useFormContext();
    
  return (
  <textarea 
      {...register(name)} 
      {...res}
      className='border-[1px] px-2 py-[4px] rounded-[4px] focus:outline-0'
      rows={4}
  />
  )
}
