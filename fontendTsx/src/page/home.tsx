
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useEvent } from '@/context/EventContext';
import EventCard from '@/features/events/components/EventCard';
import { Calendar, Eye, Smartphone, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const { events } = useEvent();
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(''); // "" means all cities
  const navigate = useNavigate();

  const getCity = (address: string) => {
    if (!address) return '';
    const parts = address.split(',');
    return parts.length >= 2 ? parts[1].trim() : parts[0].trim();
  };

  const cities = useMemo(() => {
    const citySet = new Set(events.map((e) => getCity(e.localisation?.address)));
    return Array.from(citySet);
  }, [events]);

const filteredEvents = useMemo(() => {
  return events.filter((event) => {
    const city = getCity(event.localisation?.address);

    // Show all cities if "Tous les citys" is selected
    const matchesCity =
      selectedCity === 'Tous les citys' || city.toLowerCase() === selectedCity.toLowerCase();

    const matchesSearch = event.name.toLowerCase().includes(search.toLowerCase());

    return matchesCity && matchesSearch;
  });
}, [search, selectedCity, events]);

  const handleSelect = (eventId: string) => {
    navigate(`/events/${eventId}`);
    setSearch('');
    setDropdownOpen(false);
  };

  return (
    <section className='grid gap-y-[32px] '>
      <div className="h-[80vh] md:h-[70vh] border border-accent/20 rounded-[12px] shadow-2xl relative overflow-hidden">
        {/* Hero content */}
        <div className="absolute inset-0 h-full flex flex-col gap-y-[18px] px-6 sm:px-10 md:px-16 justify-center  z-20 w-full ">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-white leading-tight font-semibold">
              Explorez <br />
              des événements holistiques <br />
              près de chez vous
            </h1>

            <p className="text-white/90 mt-[16px] text-lg md:text-xl leading-relaxed">
              Découvrez, créez et réservez des expériences bien-être, retraites et ateliers
              qui nourrissent le corps, l’esprit et l’âme. Connectez-vous à une communauté inspirante.
            </p>
          </div>

          {/* Search + City filter */}
          <div className="relative w-full">
            <div className="flex w-full border-white bg-gray-100/20 px-4 py-2 backdrop-blur-3xl border-2 rounded-full overflow-hidden">
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setDropdownOpen(true);
                }}
                className="basis-3/4 focus:outline-none text-black placeholder-gray-500"
              />

              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setDropdownOpen(false); // close dropdown when city changes
                }}
                className="basis-1/4 border-l text-white px-2 border-white focus:outline-none bg-transparent"
              >
                <option value="">Tous les villes</option>
                {cities.map((city) => (
                  <option key={city} className="text-black" value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown */}
          {isDropdownOpen && search && (
              <ul className="absolute left-0 right-0 mt-1  bg-white rounded-lg shadow-lg max-h-60 z-30 overflow-y-auto">
                {/* Show the first matching event if there is one */}
                {filteredEvents.length > 0 && (
                  <li
                    key={filteredEvents[0].id}
                    className="px-4 py-2 hover:bg-accent/20 cursor-pointer font-semibold"
                    onClick={() => handleSelect(filteredEvents[0].id)}
                  >
                    <span className="text-primary">{filteredEvents[0].name}</span> —{' '}
                    <span className="text-primary">{filteredEvents[0].localisation.address}</span>
                  </li>
                )}

                {/* Link to all matching events */}
                <li
                  className="px-4 py-2 hover:bg-accent/20 cursor-pointer text-accent font-semibold"
                  onClick={() =>
                    navigate(
                      `/events?search=${encodeURIComponent(search)}&city=${encodeURIComponent(selectedCity)}`
                    )
                  }
                >
                  {filteredEvents.length > 0
                    ? `Voir tous les ${filteredEvents.length} événements correspondants...`
                    : 'Voir tous les événements...'}
                </li>
              </ul>
            )}
          </div>
        </div>

        <div className="absolute inset-0 z-10 bg-gradient-radial from-white/30 to-transparent backdrop-blur-sm"></div>

        <img
          src="assets/img/bg-hero.avif"
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover rotate-180"
        />
      </div>
      <div className='grid gap-y-[16px]'>
        <h2>Événements à venir</h2>
       
        <div>
          <Carousel
      opts={{
        align: "start",
      }}
      orientation="horizontal"
      className="w-full  "
    >
    <div className='flex items-center justify-between'>
            <p className='text-accent hover:underline  cursor-pointer' >
              <Link to={"/events"}> Voir tous les événements →</Link>  
            </p>
      <div className='flex gap-x-[4px] items-center'>
              <CarouselPrevious  children/>
              <CarouselNext children/>
        
    </div>
    </div>
      <CarouselContent className=" h-full mt-[8px]">
                
              {events.map((event) => (
                <CarouselItem key={event.id} className="w-full">
                   <EventCard
                    event={event}
                   />
      </CarouselItem>
              ))}
            </CarouselContent>
            {/* <CarouselPrevious children={undefined} />
            <CarouselNext children={undefined} /> */}
          </Carousel>
        </div>
      </div>
      <div className='flex justify-between items-center'>
        <div className='basis-1/3  flex flex-col justify-between h-full gap-y-[8px]'>
          <div>
              <h2>Rejoignez notre communauté</h2>
                <p>
                  Partagez votre savoir holistique et faites rayonner vos événements.
                </p>
          </div>
          <Link to="/register-pro">
           <Button>Partagez votre savoir</Button>
          </Link>
          
        </div>
       <div className='basis-1/4 felx flex-col gap-y-[4px] text-right'>
          <h3 className='font-default leading-tight font-bold text-primary'>
            Le meilleur <br /> sanctuaire <br /> holistique
          </h3>            
          <span className='text-xs w-1/2'>ils ont déjà rejoint notre communauté</span>

          <ul className='flex justify-end'>
            {Array.from({ length: 5 }).map((_, index) => {
              const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

              return (
                <li
                  key={index}
                  className='p-6 rounded-full -ml-5 drop-shadow-2xl'
                  style={{ backgroundColor: randomColor }}
                >
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className='flex gap-x-[50px] h-[60vh]'>
        <div className='w-full h-full flex   text-[#58534a] rounded-[8px] bg-[#B0A796]/50 flex-col justify-between p-6'>
          <Smartphone />
          
          <div>
            <h3 className='font-default  text-[#58534a]'>Rayonnez vos ateliers</h3>
            <p className='text-[#58534a]'>Rejoignez, partagez vos événements holistiques facilement.</p>

          </div>

        </div>
        <div  className='w-full text-primary rounded-[8px] bg-accent/50 h-full flex flex-col justify-between p-6'>
          <Eye />
            <div>
            <h3 className='font-default '>Rayonnez vos ateliers</h3>
            <p>Rejoignez, partagez vos événements holistiques facilement.</p>

          </div>
          
        </div>
         <div  className='w-full h-full rounded-[8px] text-[#443640] bg-[#81667A]/50 flex flex-col justify-between p-6'>
          <Users />
            <div>
            <h3 className='font-default  text-[#443640]'>Rayonnez vos ateliers</h3>
            <p  className='text-[#443640]'>Rejoignez, partagez vos événements holistiques facilement.</p>

          </div>
          
        </div>
      </div>
      <div>
        <div className='w-full flex p-8 items-center justify-between drop-shadow-2xl bg-gradient-to-br from-[#B0A796]/20 rounded-[8px] to-[#81667A]/50 '>
          <div className='grid gap-y-[16px] basis-1/2'>
            <h2>Rejoignez plus de 2 000 abonnés</h2>
            <p>restez informé·e de tout ce que vous devez savoir.</p>

          </div>
          <div className='flex flex-1  gap-y-[16px] flex-col justify-between '>
            <div className='flex gap-x-[8px]  w-full'>
              <input type="text" placeholder='Inscrivez votre e-mail' className='px-4 hover:bg-white focus:bg-white transition bg-white/50 rounded-[4px] py-2 w-full ' />
              <div className='w-1/3'>
                              <Button>Abonnez-vous</Button>

              </div>

            </div>
            <p>Nous prenons soin de vos données dans notre politique de confidentialité</p>
            
          </div>

        </div>
      </div>
    </section>
  );
}
