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
        <textarea {...register(name)} {...res}  className='border-[1px] focus:outline-0' placeholder="Description de l'événement" rows={4} />
  )
}
