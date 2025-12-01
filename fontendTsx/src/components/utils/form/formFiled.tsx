import { OctagonAlert } from 'lucide-react'
import React, { Children } from 'react'
import { useFormContext } from 'react-hook-form'
import { useLocation } from 'react-router-dom'


type FormFiledProps = {
    label:string
    children:React.ReactNode,
    htmlFor?:string
} 


export default function FormFiled({label,children,htmlFor}:FormFiledProps) {
    const location = useLocation()
    const { formState: { errors } } = useFormContext()
    console.log(errors)
    const error = errors[htmlFor!]?.message as string | undefined
  return (

    <div className='grid gap-y-2'>
        <div className='flex justify-between items-baseline'>
            <label  htmlFor={htmlFor} >{label}</label>
            {label.toLowerCase()=="password"&& location.pathname =="/login"&&<small>Forgot your password?</small>}
        </div>
        
        {children}
         {error && (
          <div className='flex text-red-500  items-center gap-x-1'>
               <OctagonAlert size={16} /> <span className='text-sm'>{error}</span>
          </div>
  
      )}
    </div>
  )
}
