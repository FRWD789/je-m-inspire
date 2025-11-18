import React, { Children } from 'react'
import { useLocation } from 'react-router'

type FormFiledProps = {
    label:string
    children:React.ReactNode
} 


export default function FormFiled({label,children}:FormFiledProps) {
    const location = useLocation()
  return (

    <div className='grid gap-y-[8px]'>
        <div className='flex justify-between items-baseline'>
            <label >{label}</label>
            {label.toLowerCase()=="password"&& location.pathname =="/login"&&<small>Forgot your password?</small>}
        </div>
        {children}
    </div>
  )
}
