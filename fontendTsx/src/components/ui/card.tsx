import { cn } from '@/lib/utils'
import React from 'react'




type CardProps = React.InputHTMLAttributes<HTMLDivElement> & {
    children:React.ReactNode
}


export default function Card({children,...res}:CardProps) {
  return (
    
      <div {...res} className="w-full flex items-center px-[12px] bg-white/90 py-[8px] border-[2px] border-background gap-x-[12px] rounded-[8px] shadow-sm">
      {children}
    </div>
     

  )
}
