import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import FormEvents from '../../components/events/formEvents'
import EventList from '../../components/events/EventList'

export default function Events() {

    const [open,setOpen] = useState(false)
  return (
    <>
    <div>
        <div className='flex justify-between items-center'>
            <h2>Nombre des Evenment 0</h2>
            <div onClick={()=>setOpen(true)} className='flex px-[12px] py-[8px] items-center bg-text gap-x-[4px] text-background '>
                <p className='text-white'>Ajouter Un evenment</p>
                <Plus className='w-5'/>
            </div>
        </div>
        <div>
            <EventList/>

        </div>

    </div>

    {
        open&&
        <div  className='w-full fixed top-0 l h-screen bg-black/20 left-0 flex justify-center items-center'>

                <div className='px-[24px] py-[32px] grid gap-y-[24px] bg-white rounded-[12px]'>

                    <div className='flex justify-between items-center'>
                        <h2> Cree votre evenment </h2>
                        <Plus className='rotate-45' onClick={()=>setOpen(!open)}/>
                  </div> 
                  <div className='max-h-[600px] px-[16px] py-[24px] overflow-y-auto'>
                      <FormEvents type='create'/>

                  </div>
                  

                </div>
               
        </div>
    }
    
    </>

  )
}
