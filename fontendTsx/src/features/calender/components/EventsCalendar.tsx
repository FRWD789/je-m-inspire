import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, MapPin, Calendar as CalendarIcon, Users, Calendar } from 'lucide-react';
import type { Event } from '@/types/events';
import EventCard from '@/features/events/components/EventCard';

const EventsCalendar = ({events}:{events:Event[]}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Check if a date has events
  const getEventsForDate = (day) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      return checkDate >= new Date(startDate.toDateString()) && 
             checkDate <= new Date(endDate.toDateString());
    });
  };

  // Handle date click
  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayEvents = getEventsForDate(day);
    
    if (dayEvents.length > 0) {
      setSelectedDate({ date: clickedDate, events: dayEvents });
      setShowModal(true);
    }
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(
      <div 
        key={`empty-${i}`} 
        className="hidden sm:block h-16 md:h-24 bg-gray-50"
      ></div>
    );
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(day);
    const hasEvents = dayEvents.length > 0;
    const isToday = 
      day === new Date().getDate() && 
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear();

    calendarDays.push(
      <div
        key={day}
        onClick={() => handleDateClick(day)}
        className={`h-16 sm:h-20 md:h-24 border border-gray-200 p-1 sm:p-2 transition-all overflow-hidden flex flex-col ${
          hasEvents ? 'cursor-pointer hover:bg-blue-50 bg-white' : 'bg-white'
        } ${isToday ? 'ring-2 ring-accent' : ''}`}
      >
        <div className={`text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 ${
          isToday ? 'text-accent' : 'text-gray-700'
        }`}>
          {day}
        </div>
        {hasEvents && (
          <div className="space-y-0.5 overflow-hidden flex-1">
            {dayEvents.slice(0, isMobile ? 1 : 2).map(event => (
              <div
                key={event.id}
                className="text-xs bg-primary text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded truncate"
                title={event.name}
              >
                {event.name}
              </div>
            ))}
            {dayEvents.length > (isMobile ? 1 : 2) && (
              <div className="text-xs text-primary font-semibold truncate">
                +{dayEvents.length - (isMobile ? 1 : 2)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Calendar Header */}
      <div className='flex gap-2 items-center mb-3 md:mb-6'>
        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        <h1 className="text-lg md:text-2xl font-semibold">Calendrier</h1>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Day Names - Hidden on mobile */}
      <div className="hidden sm:grid grid-cols-7 gap-0 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2 text-sm md:text-base">
            {day}
          </div>
        ))}
      </div>

      {/* Mobile Day Names - Abbreviated */}
      <div className="grid grid-cols-7 gap-0 mb-2 sm:hidden">
        {dayNames.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-1 text-xs">
            {day.substring(0, 1)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {calendarDays}
      </div>

      {/* Event Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-3xl flex items-end sm:items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-t-lg sm:rounded-lg w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto shadow-2xl">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between gap-2 shadow-sm z-10">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex-1 break-words">
                Événements - {selectedDate.date.toLocaleDateString('fr-FR', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Content - Grid of Event Cards */}
            <div className="p-3 sm:p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {selectedDate.events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;