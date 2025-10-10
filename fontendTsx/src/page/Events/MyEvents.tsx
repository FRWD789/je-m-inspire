import EventList from '@/components/events/EventList'
import FormEvents from '@/components/events/formEvents'
import { useEvent } from '@/context/EventContext'
import { Loader, Plus } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export default function MyEvents() {
    const {loading,myEvents} =  useEvent()
    const menuRef = useRef<HTMLDivElement>(null);
    const [open,setOpen] = useState(false)
        useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
              if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
              }
            }
        
            if (open) document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
          }, [open]);
  return (
    <>
    <div>
        <div className='flex justify-between items-center'>
            <h2>Nombre des Evenment Creé {myEvents.length}</h2>
            <div onClick={()=>setOpen(true)} className='flex px-[12px] rounded-[4px] py-[8px] items-center bg-text gap-x-[4px] text-background '>
                <p className='text-white'>Ajouter Un evenment</p>
                <Plus className='w-5'/>
            </div>
        </div>
        <div className='max-h-full overflow-y-auto'>
            {loading?<Loader className='animate-spin'/> :<EventList events={myEvents}/>}
      
        </div>

    </div>

    {
        open&&
          <div  className='w-full fixed top-0 left-0 h-screen bg-black/20   '>
        
                        <div ref={menuRef} className='px-[24px] py-[32px] h-screen grid gap-y-[24px] absolute top-0 right-0 bg-white '>
        
                           <div className='flex justify-between items-center'>
                                    <h2> Cree votre evenment </h2>
                                    <Plus className='rotate-45' onClick={()=>setOpen(!open)}/>
                                </div> 
                            <div className='max-h-[600px] px-[16px] py-[24px] overflow-y-auto'>
                                <FormEvents type='create' onSuccess={() => setOpen(false)}/>

                            </div>
                          
        
                        </div>
                       
                </div>
 
    }
    
    </>

  )
}
