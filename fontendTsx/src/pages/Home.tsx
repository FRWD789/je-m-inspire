import React from 'react'
import useRefreshToken from '../hooks/useRefreshToken'
import axios from 'axios'
import useApi from '../hooks/useApi'
import usePrivateApi from '../hooks/usePrivateApi'
import Silk from '../components/ui/Silk'
import {Search} from"lucide-react"
import { CarouselHero } from '@/components/ui/CarouselHero'
import Button from '@/components/Button'
import AvatarStack from '@/components/ui/AvaterStack'
import FeatureCards from '@/components/ui/FeatureCards'

function Home() {


  return (
    <> 
    <section className='grid gap-y-[32px]'>
          <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden drop-shadow-primary/15 drop-shadow-2xl">
      {/* Background Image */}
      <img
        src="assets/img/hero.jpg"
        alt="Hero background"
        loading="lazy"
        className="w-full h-full object-cover object-center"
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center md:items-start gap-6 px-6 md:px-12 lg:px-20 bg-bg/15 backdrop-blur-sm">
        {/* Headline */}
        <h1 className="font-headings text-7xl  font-black text-bg">
          Explorez des événements <br className="hidden md:block" /> 
          holistiques <br />près de chez vous
        </h1>

        {/* Search Bar */}
        <div className="flex  items-center w-full border-2 border-white/50 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 drop-shadow-lg">
          <input
            type="text"
            placeholder="Recherchez un événement..."
            aria-label="Rechercher des événements"
            className="flex-1 bg-transparent placeholder-white/70 text-white focus:outline-none text-base md:text-lg"
          />
          <Search className="text-white w-5 h-5" />
        </div>
      </div>
    </div>
    <div>
      <h2>
        Événements à venir
      </h2>
      <div>
        <CarouselHero />
      </div>
    </div>
    <div className='grid gap-y-[24px] '>
      <div className='flex flex-col md:flex-row justify-between'>
        <div className='grid gap-y-[8px] basis-1/4'>
                <h2 className='font-headings text-text'>Rejoignez notre <br />communauté</h2>
                <p className='text-primary/75'>Partagez votre savoir holistique et faites rayonner vos événements.</p>
                <Button type='button' >Partagez votre savoir</Button>
        </div>
        <div className='grid gap-y-[8px] basis-1/4 leading-none'>
          <h3 className='font-bold leading-none'>Le meilleur sanctuaire holistique</h3>
          <p >
            ils ont déjà rejoint notre communauté
          </p>
          <div >
             <AvatarStack/>

          </div>
        
        </div>
      </div>
      <div className='h-[50vh]'>
          <FeatureCards/>
      </div>
       
    </div>

    </section>


    
    </>
  )
}

export default Home
