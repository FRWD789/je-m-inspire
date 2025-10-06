import React from 'react';



type SideNavProps = {
    open:boolean
    children:React.ReactNode
    width?:string
}

export default function SideNav({ open, children, width = '16' }:SideNavProps) {
  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white text-primary transition-all px-[12px] py-[32px] duration-300 overflow-hidden`}
      style={{ width: open ? `${width}rem` : '0rem' ,padding:  open ? `${width}px` : '0px'}}
    >
     
      <div className={`transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}>
        {children}
      </div>
    </div>
  );
}
