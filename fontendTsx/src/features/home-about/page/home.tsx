import Button from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useEvent } from '@/context/EventContext';
import EventCard from '@/features/events/components/EventCard';
import { Eye, Smartphone, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 

export default function Home() {
  const { t } = useTranslation(); 
  const { events } = useEvent();
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(''); 
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
   
      const matchesCity =
        selectedCity === '' || selectedCity === t('home.allCities') || city.toLowerCase() === selectedCity.toLowerCase();

      const matchesSearch = event.name.toLowerCase().includes(search.toLowerCase());

      return matchesCity && matchesSearch;
    });
  }, [search, selectedCity, events, t]);

  const handleSelect = (eventId: string) => {
    navigate(`/events/${eventId}`);
    setSearch('');
    setDropdownOpen(false);
  };

  return (
    <section className='grid gap-y-[32px] '>
      <div className="h-[50vh] w-full sm:h-[60vh] md:h-[70vh] lg:h-[80vh] border border-accent/20 rounded-lg sm:rounded-xl md:rounded-[12px] shadow-2xl relative overflow-hidden">
        {/* Hero content */}
        <div className="absolute inset-0 h-full flex flex-col gap-y-3 sm:gap-y-4 md:gap-y-6 px-4 sm:px-6 md:px-10 lg:px-16 justify-center z-20 w-full">
          <div>
           
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white leading-tight font-semibold">
              {t('home.heroTitle')}
            </h1>

            <p className="text-white/90 mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl">
              {t('home.heroSubtitle')}
            </p>
          </div>

          {/* Search + City filter */}
          <div className="relative w-full">
            <div className="flex flex-col sm:flex-row w-full border-white bg-gray-100/20 px-3 sm:px-4 md:px-5 py-2 md:py-3 backdrop-blur-3xl border-2 rounded-full overflow-hidden gap-2 sm:gap-0">
              <input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setDropdownOpen(true);
                }}
                className="basis-full sm:basis-3/4 focus:outline-none text-black placeholder-gray-500 text-sm md:text-base bg-transparent"
              />

              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setDropdownOpen(false);
                }}
                className="basis-full sm:basis-1/4 border-0 sm:border-l text-white px-2 md:px-3 border-white focus:outline-none bg-transparent text-sm md:text-base"
              >
                <option value="">{t('home.allCities')}</option>
                {cities.map((city) => (
                  <option key={city} className="text-black" value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown */}
            {isDropdownOpen && search && (
              <ul className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg max-h-60 z-30 overflow-y-auto text-sm md:text-base">
                {/* Show the first matching event if there is one */}
                {filteredEvents.length > 0 && (
                  <li
                    key={filteredEvents[0].id}
                    className="px-3 sm:px-4 py-2 hover:bg-accent/20 cursor-pointer font-semibold transition"
                    onClick={() => handleSelect(filteredEvents[0].id)}
                  >
                    <span className="text-primary">{filteredEvents[0].name}</span> —{' '}
                    <span className="text-primary text-xs sm:text-sm truncate">
                      {filteredEvents[0].localisation.address}
                    </span>
                  </li>
                )}

                {/* Link to all matching events */}
                <li
                  className="px-3 sm:px-4 py-2 hover:bg-accent/20 cursor-pointer text-accent font-semibold transition text-xs sm:text-sm"
                  onClick={() =>
                    navigate(
                      `/events?search=${encodeURIComponent(search)}&city=${encodeURIComponent(selectedCity)}`
                    )
                  }
                >
                  {filteredEvents.length > 0
                    ? t('home.viewAllWithCount', { count: filteredEvents.length })
                    : t('home.viewAll')}
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

      <div className='grid gap-y-3 md:gap-y-4 lg:gap-y-6'>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">{t('home.upcomingEvents')}</h2>

        <div>
          <Carousel
            opts={{
              align: "start",
            }}
            orientation="horizontal"
            className="w-full"
          >
            <div className='flex items-center justify-between mb-3 md:mb-4 lg:mb-6 gap-2'>
              <p className='text-accent hover:underline cursor-pointer text-xs md:text-sm lg:text-base transition'>
                <Link to={"/events"}> {t('home.viewAll')} →</Link>
              </p>
              <div className='flex gap-x-1 md:gap-x-2 items-center flex-shrink-0'>
                <CarouselPrevious children className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10" />
                <CarouselNext children className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10" />
              </div>
            </div>

            <CarouselContent className="h-full max-w-[90vw] md:w-full mt-0">
              {events.map((event) => (
                <CarouselItem
                  key={event.id}
                  className=" sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-2 sm:pl-3 md:pl-4"
                >
                  <EventCard event={event} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 h-auto md:h-56 lg:h-64 xl:h-72'>
        {/* Card 1 - Smartphone */}
        <div className='w-full h-40 sm:h-48 md:h-full flex text-[#58534a] rounded-lg md:rounded-[8px] bg-[#B0A796]/50 flex-col justify-between p-4 md:p-5 lg:p-6 hover:shadow-lg transition-shadow'>
          <Smartphone className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />

          <div>
            <h3 className='font-bold text-base md:text-lg text-[#58534a]'>{t('home.cards.title')}</h3>
            <p className='text-sm md:text-base text-[#58534a] mt-1'>{t('home.cards.description')}</p>
          </div>
        </div>

        {/* Card 2 - Eye */}
        <div className='w-full h-40 sm:h-48 md:h-full text-primary rounded-lg md:rounded-[8px] bg-accent/50 flex flex-col justify-between p-4 md:p-5 lg:p-6 hover:shadow-lg transition-shadow'>
          <Eye className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />

          <div>
            <h3 className='font-bold text-base md:text-lg'>{t('home.cards.title')}</h3>
            <p className='text-sm md:text-base mt-1'>{t('home.cards.description')}</p>
          </div>
        </div>

        {/* Card 3 - Users */}
        <div className='w-full h-40 sm:h-48 md:h-full rounded-lg md:rounded-[8px] text-[#443640] bg-[#81667A]/50 flex flex-col justify-between p-4 md:p-5 lg:p-6 hover:shadow-lg transition-shadow'>
          <Users className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />

          <div>
            <h3 className='font-bold text-base md:text-lg text-[#443640]'>{t('home.cards.title')}</h3>
            <p className='text-sm md:text-base text-[#443640] mt-1'>{t('home.cards.description')}</p>
          </div>
        </div>
      </div>
      
      <div className='w-full flex flex-col md:flex-row p-4 sm:p-6 md:p-8 lg:p-10 items-start md:items-center justify-between gap-4 md:gap-6 lg:gap-8 drop-shadow-2xl bg-gradient-to-br from-[#B0A796]/20 rounded-lg md:rounded-[8px] to-[#81667A]/50'>
        {/* Left Section - Heading & Description */}
        <div className='w-full md:basis-1/2 grid gap-y-2 md:gap-y-3 lg:gap-y-4'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold'>{t('home.newsletter.title')}</h2>
          <p className='text-sm md:text-base text-gray-700'>{t('home.newsletter.subtitle')}</p>
        </div>

        {/* Right Section - Form */}
        <div className='w-full md:flex-1 flex flex-col gap-y-3 md:gap-y-4'>
          {/* Email Input + Button */}
          <div className='flex flex-col sm:flex-row gap-y-2 sm:gap-x-2 w-full'>
            <input
              type="email"
              placeholder={t('home.newsletter.placeholder')}
              className='px-3 md:px-4 py-2 md:py-3 hover:bg-white focus:bg-white focus:outline-none transition bg-white/50 rounded-md flex-1 text-sm md:text-base'
            />
            <div className='w-full sm:w-auto'>
              <Button className='w-full'>{t('home.newsletter.button')}</Button>
            </div>
          </div>

          {/* Privacy Text */}
          <p className='text-xs md:text-sm text-gray-600'>{t('home.newsletter.privacy')}</p>
        </div>
      </div>
    </section>
  );
}