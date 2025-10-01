  
  
  import React from 'react'
import type { FieldError } from 'react-hook-form';
  
type FormFieldProps = {
  label: string;
  error: FieldError | undefined;
  children:React.ReactNode
};


  export default function FormField({children,label,error}:FormFieldProps) {
    return (
     <div>
      <label className={`block text-sm font-medium mb-2 ${error? error.message?"text-red-600" : "text-gray-700":"text-gray-700"}`}>{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error?.message}</p>}
    </div>
    )
  }
  
  
  
